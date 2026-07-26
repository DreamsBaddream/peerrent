import RentModal from "@/components/RentModal"
import ItemGallery from "@/components/ItemGallery"
import UsdEstimate from "@/components/CsprPrice"
import { Listing } from "@/lib/types"
import Link from "next/link"
import { ChevronLeft, ShieldCheck, BadgeCheck, User, ExternalLink } from "lucide-react"

type ListingOwner = {
  id: string
  phone: string
  wallet_address: string | null
  verified: boolean
}

type ListingWithOwner = Listing & { owner?: ListingOwner | null }

function maskPhone(phone: string) {
  if (!phone || phone.length <= 4) return phone
  return `${phone.slice(0, 3)} ••• ${phone.slice(-2)}`
}

async function getListing(id: string): Promise<ListingWithOwner | null> {
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
      <Link
        href="/"
        className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-[0.1em] text-ink/45 hover:text-ink mb-8 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" strokeWidth={2} />
        Browse
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <ItemGallery
          photos={listing.photos}
          title={listing.title}
          refId={listing.id.slice(0, 4).toUpperCase()}
        />

        <div className="space-y-6">
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
              <UsdEstimate cspr={listing.price_per_day} per="day" className="text-xs" />
            </div>
          </div>

          {listing.description && (
            <div>
              <h2 className="mono-label mb-3">Description</h2>
              <p className="text-ink/70 text-sm leading-relaxed">{listing.description}</p>
            </div>
          )}

          <div className="card-log p-5 space-y-3">
            <h3 className="mono-label">Pricing</h3>
            <div className="flex justify-between text-sm font-mono">
              <span className="text-ink/60">Daily rate</span>
              <span className="text-ink font-medium">
                {listing.price_per_day} CSPR{" "}
                <UsdEstimate cspr={listing.price_per_day} className="text-[11px] ml-1" />
              </span>
            </div>
            <div className="flex justify-between text-sm font-mono">
              <span className="text-ink/60">Security deposit</span>
              <span className="text-ink font-medium">
                {listing.deposit_amount} CSPR{" "}
                <UsdEstimate cspr={listing.deposit_amount} className="text-[11px] ml-1" />
              </span>
            </div>
            <div className="rule" />
            <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.06em] text-ink/45 leading-relaxed">
              <ShieldCheck className="w-3.5 h-3.5 text-ok shrink-0" strokeWidth={1.75} />
              Deposit locked on-chain via Casper. Released after AI damage check.
            </p>
          </div>

          {listing.owner && (
            <div className="card-log p-5">
              <h3 className="mono-label mb-3">Listed By</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 border border-ink flex items-center justify-center bg-paper shrink-0">
                  <User className="w-5 h-5 text-ink/50" strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-ink/80 truncate">
                      {maskPhone(listing.owner.phone)}
                    </span>
                    {listing.owner.verified && (
                      <span className="stamp stamp-ok shrink-0">
                        <BadgeCheck className="w-3 h-3" strokeWidth={2} />
                        Verified
                      </span>
                    )}
                  </div>
                  {listing.owner.wallet_address && (
                    <a
                      href={`https://testnet.cspr.live/account/${listing.owner.wallet_address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.06em] text-accent/80 hover:text-accent transition-colors mt-0.5"
                    >
                      On-chain account
                      <ExternalLink className="w-2.5 h-2.5" strokeWidth={1.75} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

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
