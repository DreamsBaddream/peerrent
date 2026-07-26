"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import toast from "react-hot-toast"
import { Listing, Rental } from "@/lib/types"
import UsdEstimate from "@/components/CsprPrice"
import { User, Package, Plus, ExternalLink } from "lucide-react"

type RentalWithListing = Rental & {
  listing?: { title: string; photos: string[] } | null
}

export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [rentals, setRentals] = useState<RentalWithListing[]>([])
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
    } finally {
      setLoadingRentals(false)
    }
  }

  if (!userId) {
    return (
      <div className="max-w-md mx-auto px-4 py-32 text-center">
        <div className="card-log p-10">
          <div className="w-14 h-14 border border-ink/30 flex items-center justify-center mx-auto mb-5">
            <User className="w-6 h-6 text-ink/35" strokeWidth={1.5} />
          </div>
          <p className="text-ink font-bold mb-1">Sign in to continue</p>
          <p className="text-ink/50 text-sm mb-6">
            View your listings and active rentals.
          </p>
          <Link href="/signup" className="btn-accent inline-block px-6 py-3">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-14">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="mono-label mb-1.5">Operator Log</p>
          <h1 className="font-display text-2xl uppercase tracking-tight text-ink">Dashboard</h1>
        </div>
        <Link href="/list" className="btn-accent flex items-center gap-1.5 px-4 py-2.5">
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          List Item
        </Link>
      </div>

      <section>
        <div className="flex items-center gap-4 mb-6">
          <h2 className="mono-label text-ink/70 shrink-0">My Listings</h2>
          <div className="rule flex-1" />
          {!loadingListings && (
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink/40 shrink-0">
              {String(listings.length).padStart(2, "0")} item{listings.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {loadingListings ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-log h-52 animate-pulse" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="card-log p-10 text-center">
            <div className="w-10 h-10 border border-ink/30 flex items-center justify-center mx-auto mb-4">
              <Package className="w-4 h-4 text-ink/30" strokeWidth={1.5} />
            </div>
            <p className="text-ink/50 text-sm mb-1">No listings yet.</p>
            <Link href="/list" className="link-u font-mono text-[11px] uppercase tracking-[0.1em] text-ink/70">
              Create your first listing →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((listing) => (
              <div key={listing.id} className="card-log card-log-hover overflow-hidden">
                <div className="aspect-[16/9] bg-ink/[0.04] border-b border-ink">
                  {listing.photos?.[0] ? (
                    <img
                      src={listing.photos[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-mono text-[10px] uppercase tracking-wide text-ink/25">
                      No photo
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-ink text-sm font-bold truncate mb-1.5">{listing.title}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-sm font-bold text-accent">
                      {listing.price_per_day} CSPR{" "}
                      <UsdEstimate cspr={listing.price_per_day} per="day" className="text-[10px] font-normal" />
                    </span>
                    <span className={`stamp ${listing.is_available ? "stamp-ok" : "stamp-err"}`}>
                      {listing.is_available ? "Available" : "Rented"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/edit/${listing.id}`}
                      className="btn-line flex-1 text-center text-[11px] py-1.5"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => toggleAvailability(listing.id, listing.is_available)}
                      className={`flex-1 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] py-1.5 border transition-colors ${
                        listing.is_available
                          ? "border-err/50 text-err hover:bg-err hover:text-paper2"
                          : "border-ok/50 text-ok hover:bg-ok hover:text-paper2"
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

      <section>
        <div className="flex items-center gap-4 mb-6">
          <h2 className="mono-label text-ink/70 shrink-0">My Rentals</h2>
          <div className="rule flex-1" />
          {!loadingRentals && (
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink/40 shrink-0">
              {String(rentals.length).padStart(2, "0")} rental{rentals.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {loadingRentals ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="card-log h-20 animate-pulse" />
            ))}
          </div>
        ) : rentals.length === 0 ? (
          <div className="card-log p-10 text-center">
            <p className="text-ink/50 text-sm mb-1">No rentals yet.</p>
            <Link href="/" className="link-u font-mono text-[11px] uppercase tracking-[0.1em] text-ink/70">
              Browse items to rent →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {rentals.map((rental) => (
              <div
                key={rental.id}
                className="card-log px-5 py-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {rental.listing?.photos?.[0] && (
                    <img
                      src={rental.listing.photos[0]}
                      alt={rental.listing?.title ?? "Rental item"}
                      className="w-14 h-14 object-cover border border-ink shrink-0 hidden sm:block"
                    />
                  )}
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="text-ink text-sm font-bold truncate">
                        {rental.listing?.title ?? `Order #${rental.id.slice(0, 8)}`}
                      </p>
                      <span className={`stamp ${
                        rental.status === "active"
                          ? "stamp-ok"
                          : rental.status === "returned"
                          ? "stamp-ink"
                          : "stamp-err"
                      }`}>
                        {rental.status}
                      </span>
                    </div>
                    <p className="font-mono text-[11px] text-ink/45">
                      {rental.start_date} → {rental.end_date}
                    </p>
                    {rental.tx_hash && (
                      <a
                        href={`https://testnet.cspr.live/deploy/${rental.tx_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-[11px] text-accent/80 hover:text-accent transition-colors"
                      >
                        {rental.tx_hash.slice(0, 12)}…
                        <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
                      </a>
                    )}
                  </div>
                </div>
                {rental.status === "active" && (
                  <Link
                    href={`/return/${rental.id}`}
                    className="btn-ink px-4 py-2 text-[11px] shrink-0"
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
