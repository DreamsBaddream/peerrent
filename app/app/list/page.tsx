"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import PhotoUpload from "@/components/PhotoUpload"

export default function ListPage() {
  const router = useRouter()

  useEffect(() => {
    if (!localStorage.getItem("user_id")) {
      toast.error("Sign in to list an item")
      router.replace("/signup")
    }
  }, [])

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [pricePerDay, setPricePerDay] = useState("")
  const [depositAmount, setDepositAmount] = useState("")
  const [photos, setPhotos] = useState<File[]>([])
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const userId = localStorage.getItem("user_id")
    if (!userId) { toast.error("Please sign up first"); router.push("/signup"); return }
    if (!title || !pricePerDay || !depositAmount) {
      toast.error("Please fill in all required fields")
      return
    }
    setLoading(true)
    try {
      const form = new FormData()
      form.append("title", title)
      form.append("description", description)
      form.append("price_per_day", pricePerDay)
      form.append("deposit_amount", depositAmount)
      form.append("owner_id", userId)
      photos.forEach((f) => form.append("photos", f))
      const res = await fetch("/api/listings", { method: "POST", body: form })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? "Failed to create listing")
      }
      toast.success("Listing created!")
      router.push("/dashboard")
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">List an Item</h1>
        <p className="text-white/40 text-sm">
          Share your gear and earn CSPR every time it&apos;s rented.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Details */}
        <div className="card rounded-2xl p-5 space-y-4">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Details</p>
          <div>
            <label className="block text-xs text-white/45 mb-1.5 font-medium">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Canon EOS R5 Camera"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="field w-full rounded-xl px-4 py-3 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-white/45 mb-1.5 font-medium">Description</label>
            <textarea
              placeholder="Describe the item, condition, what&apos;s included…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="field w-full rounded-xl px-4 py-3 text-sm resize-none"
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="card rounded-2xl p-5">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Pricing</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/45 mb-1.5 font-medium">
                Price / Day <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="10"
                  value={pricePerDay}
                  onChange={(e) => setPricePerDay(e.target.value)}
                  required
                  className="field w-full rounded-xl pl-4 pr-14 py-3 text-sm"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/25 pointer-events-none">
                  CSPR
                </span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-white/45 mb-1.5 font-medium">
                Deposit <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="50"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  required
                  className="field w-full rounded-xl pl-4 pr-14 py-3 text-sm"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/25 pointer-events-none">
                  CSPR
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Photos */}
        <div className="card rounded-2xl p-5">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Photos</p>
          <PhotoUpload onChange={setPhotos} />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl btn-gradient text-sm"
        >
          {loading ? "Creating listing…" : "Create Listing"}
        </button>
      </form>
    </div>
  )
}
