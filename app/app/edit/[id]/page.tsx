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
      <div className="max-w-2xl mx-auto px-4 py-24 text-center text-gray-500 text-sm">
        Loading...
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Edit Listing</h1>
        <p className="mt-2 text-gray-400 text-sm">Update your listing details.</p>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5"
      >
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-1">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1">
              Price per Day (CSPR) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={pricePerDay}
              onChange={(e) => setPricePerDay(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1">
              Deposit Amount (CSPR) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-2.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  )
}
