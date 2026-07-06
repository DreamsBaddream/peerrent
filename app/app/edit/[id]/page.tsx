"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

export default function EditListingPage(props: PageProps<"/edit/[id]">) {
  const router = useRouter()
  const [id, setId] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [pricePerDay, setPricePerDay] = useState("")
  const [depositAmount, setDepositAmount] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const userId = localStorage.getItem("user_id")
    if (!userId) {
      toast.error("Sign in to edit listings")
      router.replace("/signup")
      return
    }
    props.params.then(({ id: listingId }) => {
      setId(listingId)
      fetch(`/api/listings/${listingId}`)
        .then((r) => r.json())
        .then((data) => {
          const listing = data.listing ?? data
          if (listing.owner_id !== userId) {
            toast.error("Not your listing")
            router.replace("/dashboard")
            return
          }
          setTitle(listing.title ?? "")
          setDescription(listing.description ?? "")
          setPricePerDay(String(listing.price_per_day ?? ""))
          setDepositAmount(String(listing.deposit_amount ?? ""))
        })
        .catch(() => toast.error("Failed to load listing"))
        .finally(() => setLoading(false))
    })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const userId = localStorage.getItem("user_id")
    setSaving(true)
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner_id: userId,
          title,
          description,
          price_per_day: parseFloat(pricePerDay),
          deposit_amount: parseFloat(depositAmount),
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? "Failed to save")
      }
      toast.success("Listing updated!")
      router.push("/dashboard")
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24">
        <div className="card-log h-96 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-10">
        <p className="mono-label mb-2">Amend Entry</p>
        <h1 className="font-display text-3xl uppercase tracking-tight text-ink mb-2">Edit Listing</h1>
        <p className="text-ink/55 text-sm">Update your listing details.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="card-log p-5 space-y-4">
          <p className="mono-label">01 — Details</p>
          <div>
            <label className="block text-xs text-ink/60 mb-1.5 font-medium">
              Title <span className="text-accent">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="field w-full px-4 py-3 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-ink/60 mb-1.5 font-medium">Description</label>
            <textarea
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
                  value={pricePerDay}
                  onChange={(e) => setPricePerDay(e.target.value)}
                  required
                  className="field w-full pl-4 pr-14 py-3 text-sm font-mono"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase text-ink/35 pointer-events-none">CSPR</span>
              </div>
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
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  required
                  className="field w-full pl-4 pr-14 py-3 text-sm font-mono"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase text-ink/35 pointer-events-none">CSPR</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-line flex-1 py-3"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-accent flex-1 py-3"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  )
}
