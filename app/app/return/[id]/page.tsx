"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import PhotoUpload from "@/components/PhotoUpload"
import { Rental } from "@/lib/types"
import { CheckCircle2, AlertCircle, Star } from "lucide-react"

interface ReturnResult {
  damage_detected: boolean
  notes?: string
}

export default function ReturnPage(props: PageProps<"/return/[id]">) {
  const router = useRouter()
  const [rentalId, setRentalId] = useState<string>("")
  const [rental, setRental] = useState<Rental | null>(null)
  const [afterPhotos, setAfterPhotos] = useState<File[]>([])
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

  async function fetchRental(id: string) {
    try {
      const res = await fetch(`/api/rent/${id}`)
      if (res.ok) {
        const data = await res.json()
        setRental(data.rental ?? data ?? null)
      }
    } catch {
      // silently fail
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
      setResult({ damage_detected: data.damage_detected ?? false, notes: data.notes })
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
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Return Item</h1>
        <p className="text-white/40 text-sm">
          Upload after-photos so our AI can check for damage.
        </p>
      </div>

      {/* Before photos */}
      {rental?.before_photos?.length ? (
        <div className="mb-6">
          <p className="text-xs font-semibold text-white/35 uppercase tracking-wider mb-3">
            Before Photos (at pickup)
          </p>
          <div className="flex gap-2 flex-wrap">
            {rental.before_photos.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Before ${i + 1}`}
                className="w-24 h-24 object-cover rounded-xl border border-white/[0.07]"
              />
            ))}
          </div>
        </div>
      ) : null}

      {/* Return form */}
      {!result && (
        <div className="card rounded-2xl p-6 space-y-5">
          <div>
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">
              After Photos <span className="text-red-400 normal-case text-xs font-normal">* required</span>
            </p>
            <PhotoUpload onChange={setAfterPhotos} />
          </div>
          <button
            onClick={handleReturn}
            disabled={loading || !afterPhotos.length}
            className="w-full py-3.5 rounded-xl btn-gradient text-sm"
          >
            {loading ? "Analyzing with AI…" : "Submit Return"}
          </button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-5">
          <div className={`card rounded-2xl p-6 border ${
            result.damage_detected
              ? "border-red-500/25 bg-red-500/[0.06]"
              : "border-emerald-500/25 bg-emerald-500/[0.06]"
          }`}>
            <div className="flex items-center gap-3 mb-2">
              {result.damage_detected ? (
                <AlertCircle className="w-6 h-6 text-red-400 shrink-0" strokeWidth={1.75} />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" strokeWidth={1.75} />
              )}
              <p className={`font-semibold ${result.damage_detected ? "text-red-300" : "text-emerald-300"}`}>
                {result.damage_detected ? "Damage detected — deposit held" : "No damage — deposit refunded!"}
              </p>
            </div>
            {result.notes && (
              <p className="text-sm text-white/50 mt-2 leading-relaxed pl-9">{result.notes}</p>
            )}
          </div>

          {/* Rating */}
          {!ratingDone ? (
            <div className="card rounded-2xl p-6">
              <h2 className="text-white font-semibold mb-1">Rate this experience</h2>
              <p className="text-white/35 text-xs mb-5">How was your rental?</p>
              <div className="flex gap-2 mb-5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setRating(n)}
                    className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      rating >= n
                        ? "btn-gradient"
                        : "glass text-white/30 hover:text-white"
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
                className="w-full py-3 rounded-xl btn-gradient text-sm"
              >
                {ratingSubmitting ? "Submitting…" : "Submit Rating"}
              </button>
            </div>
          ) : (
            <div className="card rounded-2xl p-8 text-center">
              <p className="text-white/40 text-sm mb-5">All done! Thanks for using PeerRent.</p>
              <button
                onClick={() => router.push("/dashboard")}
                className="px-6 py-3 rounded-xl btn-gradient text-sm"
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
