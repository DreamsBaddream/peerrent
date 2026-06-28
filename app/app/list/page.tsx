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
    if (!userId) {
      toast.error("Please sign up first")
      router.push("/signup")
      return
    }

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

      const res = await fetch("/api/listings", {
        method: "POST",
        body: form,
      })

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">List an Item</h1>
        <p className="mt-2 text-gray-400">
          Share your gear and earn CSPR when others rent it.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5"
      >
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-1">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Canon EOS R5 Camera"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            placeholder="Describe the item, condition, what's included..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500 resize-none"
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
              placeholder="10"
              value={pricePerDay}
              onChange={(e) => setPricePerDay(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500"
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
              placeholder="50"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Photos
          </label>
          <PhotoUpload onChange={setPhotos} />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition-colors disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Listing"}
        </button>
      </form>
    </div>
  )
}
