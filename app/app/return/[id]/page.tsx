"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import PhotoUpload from "@/components/PhotoUpload"
import { Rental } from "@/lib/types"
import { Star, ScanSearch, ShieldCheck, ShieldAlert } from "lucide-react"

interface ReturnResult {
  damage_detected: boolean
  notes?: string
}

export default function ReturnPage(props: PageProps<"/return/[id]">) {
  const router = useRouter()
  const [rentalId, setRentalId] = useState<string>("")
  const [rental, setRental] = useState<Rental | null>(null)
  const [afterPhotos, setAfterPhotos] = useState<File[]>([])
  const [afterPreviews, setAfterPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ReturnResult | null>(null)
  const [rating, setRating] = useState(0)
  const [ratingSubmitting, setRatingSubmitting] = useState(false)
  const [ratingDone, setRatingDone] = useState(false)

  useEffect(() => {
    props.params.then(({ id }) => {
      setRentalId(id)
      fetchRental(id)
    })
  }, [])

  useEffect(() => {
    const urls = afterPhotos.map((f) => URL.createObjectURL(f))
    setAfterPreviews(urls)
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [afterPhotos])

  async function fetchRental(id: string) {
    try {
      const res = await fetch(`/api/rent/${id}`)
      if (res.ok) {
        const data = await res.json()
        setRental(data.rental ?? data ?? null)
      }
    } catch {
    }
  }

  async function handleReturn() {
    if (!afterPhotos.length) {
      toast.error("Please upload after-photos before returning")
      return
    }
    setLoading(true)
    try {
      const form = new FormData()
      form.append("rentalId", rentalId)
      afterPhotos.forEach((f) => form.append("afterPhotos", f))
      const res = await fetch("/api/return", { method: "POST", body: form })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? "Return failed")
      }
      const data = await res.json()
      setResult({ damage_detected: data.damageDetected ?? false, notes: data.reason })
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  async function handleRate() {
    if (!rating) { toast.error("Please select a rating"); return }
    setRatingSubmitting(true)
    try {
      const userId = localStorage.getItem("user_id")
      const res = await fetch("/api/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rentalId, raterId: userId, score: rating }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? "Rating failed")
      }
      toast.success("Rating submitted!")
      setRatingDone(true)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Rating failed")
    } finally {
      setRatingSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-10">
        <p className="mono-label mb-2">Return Inspection</p>
        <h1 className="font-display text-3xl uppercase tracking-tight text-ink mb-2">Return Item</h1>
        <p className="text-ink/55 text-sm">
          Upload after-photos so our AI can check for damage.
        </p>
      </div>

      {rental?.before_photos?.length ? (
        <div className="mb-6">
          <p className="mono-label mb-3">Before Photos (at pickup)</p>
          <div className="flex gap-2 flex-wrap">
            {rental.before_photos.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Before ${i + 1}`}
                className="w-24 h-24 object-cover border border-ink"
              />
            ))}
          </div>
        </div>
      ) : null}

      {!result && !loading && (
        <div className="card-log p-6 space-y-5">
          <div>
            <p className="mono-label mb-4">
              After Photos <span className="text-accent normal-case">* required</span>
            </p>
            <PhotoUpload onChange={setAfterPhotos} />
          </div>
          <button
            onClick={handleReturn}
            disabled={!afterPhotos.length}
            className="btn-accent w-full py-3.5"
          >
            Submit for AI Inspection
          </button>
        </div>
      )}

      {loading && (
        <div className="card-log p-6">
          <div className="flex items-center gap-2 mb-4">
            <ScanSearch className="w-4 h-4 text-accent" strokeWidth={2} />
            <p className="mono-label text-ink/70">AI Inspection in progress</p>
          </div>

          <div className="relative aspect-[4/3] bg-ink overflow-hidden border border-ink">
            {afterPreviews[0] ? (
              <img
                src={afterPreviews[0]}
                alt="Scanning"
                className="w-full h-full object-cover opacity-90"
              />
            ) : (
              <div className="w-full h-full bg-ink/90" />
            )}
            <div className="absolute inset-0 scan-grid" />
            <div className="scan-line" />
            <div className="absolute bottom-0 inset-x-0 bg-ink/80 px-3 py-2 flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-paper2/90">
                Comparing against pickup condition
              </span>
              <span className="flex gap-1 ml-auto">
                <span className="w-1 h-1 bg-accent dot-flash" />
                <span className="w-1 h-1 bg-accent dot-flash dot-flash-2" />
                <span className="w-1 h-1 bg-accent dot-flash dot-flash-3" />
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-1.5 font-mono text-[11px] text-ink/50">
            <p>▸ Reading after-photos…</p>
            <p>▸ Detecting new damage vs. pickup state…</p>
            <p>▸ Computing on-chain deposit verdict…</p>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-5">
          <div className={`card-log p-8 text-center ${
            result.damage_detected ? "bg-err/[0.04]" : "bg-ok/[0.04]"
          }`}>
            <div
              className={`stamp-verdict inline-flex items-center gap-2 border-[3px] font-display uppercase text-xl md:text-2xl px-5 py-2.5 tracking-tight mb-4 ${
                result.damage_detected
                  ? "border-err text-err"
                  : "border-ok text-ok"
              }`}
            >
              {result.damage_detected ? (
                <ShieldAlert className="w-6 h-6" strokeWidth={2.25} />
              ) : (
                <ShieldCheck className="w-6 h-6" strokeWidth={2.25} />
              )}
              {result.damage_detected ? "Damage Detected" : "Passed Inspection"}
            </div>
            <p className={`font-mono text-xs uppercase tracking-[0.1em] mb-3 ${
              result.damage_detected ? "text-err" : "text-ok"
            }`}>
              {result.damage_detected ? "Deposit held on-chain" : "Deposit refunded"}
            </p>
            {result.notes && (
              <p className="text-sm text-ink/60 leading-relaxed max-w-md mx-auto">
                <span className="mono-label block mb-1">AI Inspector Notes</span>
                {result.notes}
              </p>
            )}
          </div>

          {(rental?.before_photos?.[0] || afterPreviews[0]) && (
            <div className="card-log p-5">
              <h3 className="mono-label mb-3">Inspection Evidence</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink/45 mb-1.5">Pickup</p>
                  <div className="aspect-[4/3] border border-ink/40 overflow-hidden bg-ink/[0.04]">
                    {rental?.before_photos?.[0] ? (
                      <img src={rental.before_photos[0]} alt="Before" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-mono text-[10px] uppercase text-ink/30">n/a</div>
                    )}
                  </div>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink/45 mb-1.5">Return</p>
                  <div className={`aspect-[4/3] border overflow-hidden bg-ink/[0.04] ${result.damage_detected ? "border-err" : "border-ok"}`}>
                    {afterPreviews[0] ? (
                      <img src={afterPreviews[0]} alt="After" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-mono text-[10px] uppercase text-ink/30">n/a</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!ratingDone ? (
            <div className="card-log p-6">
              <h2 className="text-ink font-bold mb-1">Rate this experience</h2>
              <p className="text-ink/45 text-xs mb-5">How was your rental?</p>
              <div className="flex gap-2 mb-5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setRating(n)}
                    className={`flex-1 flex items-center justify-center gap-1 py-2.5 font-mono text-sm font-bold border transition-all ${
                      rating >= n
                        ? "bg-accent border-ink text-paper2 shadow-[2px_2px_0_#1c1a13]"
                        : "border-ink/35 text-ink/40 hover:text-ink hover:border-ink"
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${rating >= n ? "fill-current" : ""}`} strokeWidth={rating >= n ? 0 : 1.5} />
                    {n}
                  </button>
                ))}
              </div>
              <button
                onClick={handleRate}
                disabled={ratingSubmitting || !rating}
                className="btn-ink w-full py-3"
              >
                {ratingSubmitting ? "Submitting…" : "Submit Rating"}
              </button>
            </div>
          ) : (
            <div className="card-log p-8 text-center">
              <p className="text-ink/55 text-sm mb-5">All done! Thanks for using PeerRent.</p>
              <button
                onClick={() => router.push("/dashboard")}
                className="btn-accent px-6 py-3"
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
