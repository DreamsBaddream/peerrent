"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import toast from "react-hot-toast"
import { Listing, Rental } from "@/lib/types"
import { User, Package, Plus, ExternalLink } from "lucide-react"

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
      <div className="max-w-md mx-auto px-4 py-32 text-center">
        <div className="card rounded-2xl p-10">
          <div className="w-14 h-14 rounded-full glass flex items-center justify-center mx-auto mb-5">
            <User className="w-6 h-6 text-white/30" strokeWidth={1.5} />
          </div>
          <p className="text-white font-semibold mb-1">Sign in to continue</p>
          <p className="text-white/35 text-sm mb-6">
            View your listings and active rentals.
          </p>
          <Link href="/signup" className="inline-block px-6 py-3 rounded-xl btn-gradient text-sm">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-14">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-white/35 text-sm mt-0.5">Manage your listings and rentals</p>
        </div>
        <Link href="/list" className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl btn-gradient text-sm">
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          List Item
        </Link>
      </div>

      {/* My Listings */}
      <section>
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest shrink-0">My Listings</h2>
          <div className="flex-1 h-px bg-white/[0.05]" />
          {!loadingListings && (
            <span className="text-xs text-white/20 shrink-0">{listings.length} item{listings.length !== 1 ? "s" : ""}</span>
          )}
        </div>

        {loadingListings ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card rounded-2xl h-52 animate-pulse" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="card rounded-2xl p-10 text-center">
            <div className="w-10 h-10 rounded-full glass flex items-center justify-center mx-auto mb-4">
              <Package className="w-4 h-4 text-white/25" strokeWidth={1.5} />
            </div>
            <p className="text-white/35 text-sm mb-1">No listings yet.</p>
            <Link href="/list" className="text-xs gradient-text hover:opacity-80 transition-opacity">
              Create your first listing →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((listing) => (
              <div key={listing.id} className="card rounded-2xl overflow-hidden">
                <div className="aspect-[16/9] bg-white/[0.03]">
                  {listing.photos?.[0] ? (
                    <img
                      src={listing.photos[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/15 text-xs">
                      No photo
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-white/[0.05]">
                  <p className="text-white text-sm font-semibold truncate mb-1.5">{listing.title}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="gradient-text text-sm font-bold">{listing.price_per_day} CSPR</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      listing.is_available
                        ? "bg-emerald-400/10 text-emerald-400"
                        : "bg-red-400/10 text-red-400"
                    }`}>
                      {listing.is_available ? "Available" : "Rented"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/edit/${listing.id}`}
                      className="flex-1 text-center text-xs py-1.5 rounded-lg glass text-white/45 hover:text-white transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => toggleAvailability(listing.id, listing.is_available)}
                      className={`flex-1 text-xs py-1.5 rounded-lg border transition-colors ${
                        listing.is_available
                          ? "border-red-500/20 text-red-400 hover:bg-red-500/10"
                          : "border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
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
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest shrink-0">My Rentals</h2>
          <div className="flex-1 h-px bg-white/[0.05]" />
          {!loadingRentals && (
            <span className="text-xs text-white/20 shrink-0">{rentals.length} rental{rentals.length !== 1 ? "s" : ""}</span>
          )}
        </div>

        {loadingRentals ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="card rounded-2xl h-20 animate-pulse" />
            ))}
          </div>
        ) : rentals.length === 0 ? (
          <div className="card rounded-2xl p-10 text-center">
            <p className="text-white/35 text-sm mb-1">No rentals yet.</p>
            <Link href="/" className="text-xs gradient-text hover:opacity-80 transition-opacity">
              Browse items to rent →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {rentals.map((rental) => (
              <div
                key={rental.id}
                className="card rounded-2xl px-5 py-4 flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <p className="text-white text-sm font-medium font-mono">
                      #{rental.id.slice(0, 8)}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      rental.status === "active"
                        ? "bg-emerald-400/10 text-emerald-400"
                        : rental.status === "returned"
                        ? "bg-white/[0.06] text-white/35"
                        : "bg-red-400/10 text-red-400"
                    }`}>
                      {rental.status}
                    </span>
                  </div>
                  <p className="text-white/30 text-xs">
                    {rental.start_date} → {rental.end_date}
                  </p>
                  {rental.tx_hash && (
                    <a
                      href={`https://testnet.cspr.live/deploy/${rental.tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-emerald-400/60 hover:text-emerald-400 font-mono transition-colors"
                    >
                      {rental.tx_hash.slice(0, 12)}…
                      <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
                    </a>
                  )}
                </div>
                {rental.status === "active" && (
                  <Link
                    href={`/return/${rental.id}`}
                    className="px-4 py-2 rounded-xl btn-gradient text-xs"
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
