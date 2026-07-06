import RentModal from "@/components/RentModal"
import { Listing } from "@/lib/types"
import Link from "next/link"
import { ChevronLeft, ShieldCheck } from "lucide-react"

async function getListing(id: string): Promise<Listing | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/listings/${id}`,
      { cache: "no-store" }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.listing ?? data ?? null
  } catch {
    return null
  }
}

export default async function ItemPage(props: PageProps<"/item/[id]">) {
  const { id } = await props.params
  const listing = await getListing(id)

  if (!listing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-32 text-center">
        <p className="text-ink/50 text-lg mb-4">Item not found.</p>
        <Link href="/" className="font-mono text-xs uppercase tracking-[0.1em] text-accent hover:opacity-75 transition-opacity">
          ← Back to Browse
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-[0.1em] text-ink/45 hover:text-ink mb-8 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" strokeWidth={2} />
        Browse
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Photos */}
        <div className="space-y-3">
          <div className="aspect-[4/3] bg-ink/[0.04] overflow-hidden card-log relative">
            {listing.photos.length > 0 ? (
              <img
                src={listing.photos[0]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-mono text-xs uppercase tracking-wide text-ink/30">
                No photos
              </div>
            )}
            <span className="absolute top-2 left-2 bg-paper2 border border-ink font-mono text-[9px] font-semibold tracking-[0.12em] uppercase px-1.5 py-0.5">
              REF·{listing.id.slice(0, 4).toUpperCase()}
            </span>
          </div>
          {listing.photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {listing.photos.slice(1).map((photo, i) => (
                <img
                  key={i}
                  src={photo}
                  alt={`${listing.title} ${i + 2}`}
                  className="w-20 h-20 object-cover border border-ink/40 flex-shrink-0 hover:border-accent transition-colors"
                />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          {/* Availability stamp + title + price */}
          <div>
            <div className={`stamp stamp-tilt mb-4 ${listing.is_available ? "stamp-ok" : "stamp-err"}`}>
              <span className={`w-1.5 h-1.5 ${listing.is_available ? "bg-ok" : "bg-err"}`} />
              {listing.is_available ? "Available to rent" : "Currently rented"}
            </div>

            <h1 className="font-display text-3xl md:text-4xl uppercase leading-[1.02] tracking-tight text-ink mb-4">
              {listing.title}
            </h1>

            <div className="flex items-baseline gap-2 font-mono">
              <span className="text-3xl font-bold text-accent">{listing.price_per_day}</span>
              <span className="text-ink/45 text-xs uppercase tracking-wide">CSPR / day</span>
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <div>
              <h2 className="mono-label mb-3">Description</h2>
              <p className="text-ink/70 text-sm leading-relaxed">{listing.description}</p>
            </div>
          )}

          {/* Price breakdown — spec sheet */}
          <div className="card-log p-5 space-y-3">
            <h3 className="mono-label">Pricing</h3>
            <div className="flex justify-between text-sm font-mono">
              <span className="text-ink/60">Daily rate</span>
              <span className="text-ink font-medium">{listing.price_per_day} CSPR</span>
            </div>
            <div className="flex justify-between text-sm font-mono">
              <span className="text-ink/60">Security deposit</span>
              <span className="text-ink font-medium">{listing.deposit_amount} CSPR</span>
            </div>
            <div className="rule" />
            <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.06em] text-ink/45 leading-relaxed">
              <ShieldCheck className="w-3.5 h-3.5 text-ok shrink-0" strokeWidth={1.75} />
              Deposit locked on-chain via Casper. Released after AI damage check.
            </p>
          </div>

          {/* Rent action */}
          {listing.is_available && (
            <RentModal
              listingId={listing.id}
              pricePerDay={listing.price_per_day}
              depositAmount={listing.deposit_amount}
              ownerId={listing.owner_id}
            />
          )}
        </div>
      </div>
    </div>
  )
}
