"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import PhotoUpload from "@/components/PhotoUpload"
import { Rental } from "@/lib/types"

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

      const res = await fetch("/api/return", {
        method: "POST",
        body: form,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? "Return failed")
      }

      const data = await res.json()
      setResult({
        damage_detected: data.damage_detected ?? false,
        notes: data.notes,
      })
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  async function handleRate() {
    if (!rating) {
      toast.error("Please select a rating")
      return
    }
    setRatingSubmitting(true)
    try {
      const userId = localStorage.getItem("user_id")
      const res = await fetch("/api/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rentalId,
          raterId: userId,
          score: rating,
        }),
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Return Item</h1>
        <p className="mt-2 text-gray-400 text-sm">
          Upload after-photos so our AI can check for damage.
        </p>
      </div>

      {/* Before photos */}
      {rental?.before_photos?.length ? (
        <div className="mb-6">
          <h2 className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-3">
            Before Photos (at pickup)
          </h2>
          <div className="flex gap-2 flex-wrap">
            {rental.before_photos.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Before ${i + 1}`}
                className="w-24 h-24 object-cover rounded-lg border border-gray-700"
              />
            ))}
          </div>
        </div>
      ) : null}

      {/* Return form — shown until result */}
      {!result && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
          <div>
            <h2 className="text-gray-300 text-sm font-medium mb-2">
              After Photos <span className="text-red-400">*</span>
            </h2>
            <PhotoUpload onChange={setAfterPhotos} />
          </div>
          <button
            onClick={handleReturn}
            disabled={loading || !afterPhotos.length}
            className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Submit Return"}
          </button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-6">
          <div
            className={`p-6 rounded-xl border ${
              result.damage_detected
                ? "bg-red-950/40 border-red-800 text-red-300"
                : "bg-emerald-950/40 border-emerald-800 text-emerald-300"
            }`}
          >
            <p className="text-lg font-semibold">
              {result.damage_detected
                ? "Damage detected — deposit held"
                : "Deposit refunded!"}
            </p>
            {result.notes && (
              <p className="mt-2 text-sm opacity-80">{result.notes}</p>
            )}
          </div>

          {/* Rating modal */}
          {!ratingDone ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-white font-semibold mb-4">
                Rate this experience
              </h2>
              <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setRating(n)}
                    className={`w-10 h-10 rounded-lg border text-sm font-semibold transition-colors ${
                      rating >= n
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-gray-700 text-gray-500 hover:border-gray-600"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <button
                onClick={handleRate}
                disabled={ratingSubmitting || !rating}
                className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm transition-colors disabled:opacity-50"
              >
                {ratingSubmitting ? "Submitting..." : "Submit Rating"}
              </button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-4">All done!</p>
              <button
                onClick={() => router.push("/dashboard")}
                className="px-6 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold transition-colors"
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
