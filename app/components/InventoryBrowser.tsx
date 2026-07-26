"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import ItemCard from "@/components/ItemCard"
import { Listing } from "@/lib/types"
import { Search, Package, X } from "lucide-react"

export default function InventoryBrowser({ listings }: { listings: Listing[] }) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return listings
    return listings.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        (l.description ?? "").toLowerCase().includes(q)
    )
  }, [listings, query])

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <h2 className="mono-label text-ink/70 shrink-0">Inventory</h2>
          <div className="rule flex-1" />
        </div>
        {listings.length > 0 && (
          <div className="relative sm:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink/35" strokeWidth={2} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search gear…"
              className="field w-full pl-9 pr-8 py-2 text-sm font-mono"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            )}
          </div>
        )}
        {listings.length > 0 && (
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink/40 shrink-0">
            {String(filtered.length).padStart(2, "0")} item{filtered.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {listings.length === 0 ? (
        <div className="card-log flex flex-col items-center justify-center py-28 text-center">
          <div className="w-12 h-12 border border-ink/30 flex items-center justify-center mb-5">
            <Package className="w-5 h-5 text-ink/30" strokeWidth={1.5} />
          </div>
          <p className="text-ink/55 text-sm mb-1">No items logged yet.</p>
          <p className="font-mono text-[11px] text-ink/35 mb-6 uppercase tracking-wide">
            Be the first entry.
          </p>
          <Link href="/list" className="btn-accent px-5 py-2.5">
            List an Item
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-log flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 border border-ink/30 flex items-center justify-center mb-5">
            <Search className="w-5 h-5 text-ink/30" strokeWidth={1.5} />
          </div>
          <p className="text-ink/55 text-sm mb-1">No matches for “{query}”.</p>
          <button
            onClick={() => setQuery("")}
            className="link-u font-mono text-[11px] uppercase tracking-[0.1em] text-ink/70 mt-2"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((listing, i) => (
            <div
              key={listing.id}
              className="rise"
              style={{ animationDelay: `${Math.min(i, 8) * 0.07 + 0.1}s` }}
            >
              <ItemCard
                id={listing.id}
                title={listing.title}
                photos={listing.photos}
                price_per_day={listing.price_per_day}
                deposit_amount={listing.deposit_amount}
              />
            </div>
          ))}
        </div>
      )}
    </>
  )
}
