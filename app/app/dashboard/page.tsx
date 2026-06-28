"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import toast from "react-hot-toast"
import { Listing, Rental } from "@/lib/types"

export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [rentals, setRentals] = useState<Rental[]>([])
  const [loadingListings, setLoadingListings] = useState(true)
  const [loadingRentals, setLoadingRentals] = useState(true)

  useEffect(() => {
    const id = localStorage.getItem("user_id")
    setUserId(id)
    if (id) {
      fetchListings(id)
      fetchRentals(id)
    } else {
      setLoadingListings(false)
      setLoadingRentals(false)
    }
  }, [])

  async function fetchListings(id: string) {
    try {
      const res = await fetch(`/api/listings?owner_id=${id}`)
      if (res.ok) {
        const data = await res.json()
        setListings(data.listings ?? data ?? [])
      }
    } catch {
      // silently fail
    } finally {
      setLoadingListings(false)
    }
  }

  async function toggleAvailability(listingId: string, currentlyAvailable: boolean) {
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner_id: userId, is_available: !currentlyAvailable }),
      })
      if (!res.ok) throw new Error("Failed to update")
      toast.success(currentlyAvailable ? "Listing unlisted" : "Listing relisted!")
      fetchListings(userId!)
    } catch {
      toast.error("Failed to update listing")
    }
  }

  async function fetchRentals(id: string) {
    try {
      const res = await fetch(`/api/rent?renter_id=${id}`)
      if (res.ok) {
        const data = await res.json()
        setRentals(data.rentals ?? data ?? [])
      }
    } catch {
      // silently fail
    } finally {
      setLoadingRentals(false)
    }
  }

  if (!userId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <p className="text-gray-400 text-lg">
          Sign in to see your rentals and listings.
        </p>
        <p className="text-gray-600 text-sm mt-1">
          Use the same phone number to restore your account.
        </p>
        <Link
          href="/signup"
          className="mt-4 inline-block px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm transition-colors"
        >
          Sign In
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <Link
          href="/list"
          className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm transition-colors"
        >
          + List New Item
        </Link>
      </div>

      {/* My Listings */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">My Listings</h2>
        {loadingListings ? (
          <div className="text-gray-500 text-sm">Loading...</div>
        ) : listings.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-500 text-sm">
              You haven&apos;t listed anything yet.
            </p>
            <Link
              href="/list"
              className="mt-3 inline-block text-emerald-400 hover:text-emerald-300 text-sm"
            >
              Create your first listing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden"
              >
                <div className="aspect-[16/9] bg-gray-800 overflow-hidden">
                  {listing.photos?.[0] ? (
                    <img
                      src={listing.photos[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                      No photo
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-white text-sm font-semibold truncate">
                    {listing.title}
                  </p>
                  <p className="text-emerald-400 text-xs mt-1">
                    {listing.price_per_day} CSPR / day
                  </p>
                  <p className="text-xs mt-1">
                    <span
                      className={
                        listing.is_available
                          ? "text-emerald-400"
                          : "text-red-400"
                      }
                    >
                      {listing.is_available ? "Available" : "Rented out"}
                    </span>
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Link
                      href={`/edit/${listing.id}`}
                      className="flex-1 text-center text-xs py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => toggleAvailability(listing.id, listing.is_available)}
                      className={`flex-1 text-xs py-1.5 rounded-lg border transition-colors ${
                        listing.is_available
                          ? "border-red-800 text-red-400 hover:bg-red-950/30"
                          : "border-emerald-800 text-emerald-400 hover:bg-emerald-950/30"
                      }`}
                    >
                      {listing.is_available ? "Unlist" : "Relist"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* My Rentals */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">My Rentals</h2>
        {loadingRentals ? (
          <div className="text-gray-500 text-sm">Loading...</div>
        ) : rentals.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-500 text-sm">
              You haven&apos;t rented anything yet.
            </p>
            <Link
              href="/"
              className="mt-3 inline-block text-emerald-400 hover:text-emerald-300 text-sm"
            >
              Browse items to rent
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {rentals.map((rental) => (
              <div
                key={rental.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between"
              >
                <div className="space-y-1">
                  <p className="text-white text-sm font-medium">
                    Rental #{rental.id.slice(0, 8)}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {rental.start_date} to {rental.end_date}
                  </p>
                  <span
                    className={`inline-block text-xs px-2 py-0.5 rounded-full ${
                      rental.status === "active"
                        ? "bg-emerald-900/50 text-emerald-400"
                        : rental.status === "returned"
                          ? "bg-gray-800 text-gray-400"
                          : "bg-red-900/50 text-red-400"
                    }`}
                  >
                    {rental.status}
                  </span>
                  {rental.tx_hash && (
                    <a
                      href={`https://testnet.cspr.live/deploy/${rental.tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-emerald-500 hover:text-emerald-400 font-mono mt-0.5"
                    >
                      {rental.tx_hash.slice(0, 12)}… ↗
                    </a>
                  )}
                </div>
                {rental.status === "active" && (
                  <Link
                    href={`/return/${rental.id}`}
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-xs transition-colors"
                  >
                    Return Item
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
