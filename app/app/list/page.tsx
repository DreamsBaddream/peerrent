"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import PhotoUpload from "@/components/PhotoUpload"
import UsdEstimate from "@/components/CsprPrice"

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
      <div className="mb-10">
        <p className="mono-label mb-2">New Entry</p>
        <h1 className="font-display text-3xl uppercase tracking-tight text-ink mb-2">List an Item</h1>
        <p className="text-ink/55 text-sm">
          Share your gear and earn CSPR every time it&apos;s rented.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="card-log p-5 space-y-4">
          <p className="mono-label">01 — Details</p>
          <div>
            <label className="block text-xs text-ink/60 mb-1.5 font-medium">
              Title <span className="text-accent">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Canon EOS R5 Camera"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="field w-full px-4 py-3 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-ink/60 mb-1.5 font-medium">Description</label>
            <textarea
              placeholder="Describe the item, condition, what&apos;s included…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="field w-full px-4 py-3 text-sm resize-none"
            />
          </div>
        </div>

        <div className="card-log p-5">
          <p className="mono-label mb-4">02 — Pricing</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-ink/60 mb-1.5 font-medium">
                Price / Day <span className="text-accent">*</span>
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
                  className="field w-full pl-4 pr-14 py-3 text-sm font-mono"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase text-ink/35 pointer-events-none">
                  CSPR
                </span>
              </div>
              {parseFloat(pricePerDay) > 0 && (
                <UsdEstimate cspr={parseFloat(pricePerDay)} per="day" className="text-[10px] mt-1.5 block" />
              )}
            </div>
            <div>
              <label className="block text-xs text-ink/60 mb-1.5 font-medium">
                Deposit <span className="text-accent">*</span>
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
                  className="field w-full pl-4 pr-14 py-3 text-sm font-mono"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase text-ink/35 pointer-events-none">
                  CSPR
                </span>
              </div>
              {parseFloat(depositAmount) > 0 && (
                <UsdEstimate cspr={parseFloat(depositAmount)} className="text-[10px] mt-1.5 block" />
              )}
            </div>
          </div>
        </div>

        <div className="card-log p-5">
          <p className="mono-label mb-4">03 — Photos</p>
          <PhotoUpload onChange={setPhotos} />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-accent w-full py-3.5"
        >
          {loading ? "Creating listing…" : "Create Listing"}
        </button>
      </form>
    </div>
  )
}
