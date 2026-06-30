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
        <p className="text-white/35 text-lg mb-4">Item not found.</p>
        <Link href="/" className="text-sm gradient-text hover:opacity-75 transition-opacity">
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
        className="inline-flex items-center gap-1 text-white/30 hover:text-white/65 text-sm mb-8 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" strokeWidth={2} />
        Browse
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Photos */}
        <div className="space-y-3">
          <div className="aspect-[4/3] bg-white/[0.03] rounded-2xl overflow-hidden card">
            {listing.photos.length > 0 ? (
              <img
                src={listing.photos[0]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/20 text-sm">
                No photos
              </div>
            )}
          </div>
          {listing.photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {listing.photos.slice(1).map((photo, i) => (
                <img
                  key={i}
                  src={photo}
                  alt={`${listing.title} ${i + 2}`}
                  className="w-20 h-20 object-cover rounded-xl border border-white/[0.07] flex-shrink-0 hover:border-emerald-400/30 transition-colors"
                />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          {/* Availability badge + title + price */}
          <div>
            <div className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full mb-3 ${
              listing.is_available
                ? "bg-emerald-400/10 text-emerald-400"
                : "bg-red-400/10 text-red-400"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${listing.is_available ? "bg-emerald-400" : "bg-red-400"}`} />
              {listing.is_available ? "Available to rent" : "Currently rented"}
            </div>

            <h1 className="text-3xl font-bold text-white leading-tight mb-3">
              {listing.title}
            </h1>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold gradient-text">{listing.price_per_day}</span>
              <span className="text-white/30 text-sm">CSPR / day</span>
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <div>
              <h2 className="text-xs font-semibold text-white/35 uppercase tracking-wider mb-3">
                Description
              </h2>
              <p className="text-white/55 text-sm leading-relaxed">{listing.description}</p>
            </div>
          )}

          {/* Price breakdown */}
          <div className="card rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-semibold text-white/35 uppercase tracking-wider">Pricing</h3>
            <div className="flex justify-between text-sm">
              <span className="text-white/45">Daily rate</span>
              <span className="text-white font-medium">{listing.price_per_day} CSPR</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/45">Security deposit</span>
              <span className="text-white font-medium">{listing.deposit_amount} CSPR</span>
            </div>
            <div className="h-px bg-white/[0.06]" />
            <p className="flex items-center gap-1.5 text-xs text-white/25">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400/60 shrink-0" strokeWidth={1.75} />
              Deposit locked on-chain via Casper smart contract. Released after AI damage check.
            </p>
          </div>

          {/* Rent action */}
          {listing.is_available && (
            <RentModal
              listingId={listing.id}
              pricePerDay={listing.price_per_day}
              depositAmount={listing.deposit_amount}
            />
          )}
        </div>
      </div>
    </div>
  )
}
