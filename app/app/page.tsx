import ItemCard from "@/components/ItemCard"
import { Listing } from "@/lib/types"
import Link from "next/link"
import { ShieldCheck, Zap, ScanFace, ArrowRight, Package } from "lucide-react"

async function getListings(): Promise<Listing[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/listings`,
      { cache: "no-store" }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.listings ?? data ?? []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const listings = await getListings()

  return (
    <>
      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-12">
        {/* Testnet stamp */}
        <div className="stamp stamp-ok stamp-tilt mb-7 rise">
          <span className="w-1.5 h-1.5 bg-ok animate-pulse" />
          Live on Casper Testnet
        </div>

        {/* Headline */}
        <h1 className="font-display text-4xl md:text-6xl uppercase leading-[0.95] tracking-tight mb-5 max-w-2xl rise rise-1">
          Borrow anything.
          <br />
          <span className="text-accent">From anyone.</span>
        </h1>

        <div className="rule-solid max-w-xs mb-5 rise rise-2" />

        {/* Sub-headline */}
        <p className="text-ink/65 text-base max-w-lg mb-8 leading-relaxed rise rise-2">
          Rent cameras, bikes, tools — from people near you.
          Deposits locked on-chain. Returns inspected by AI.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center gap-4 mb-8 rise rise-3">
          <Link
            href="#browse"
            className="btn-accent px-6 py-3 inline-flex items-center gap-2"
          >
            Browse Gear
            <ArrowRight className="w-4 h-4" strokeWidth={2.25} />
          </Link>
          <Link href="/list" className="btn-line px-6 py-3">
            List an Item
          </Link>
        </div>

        {/* Spec sheet trust markers */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rise rise-4">
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink/55">
            <ShieldCheck className="w-3.5 h-3.5 text-ok" strokeWidth={1.75} />
            On-chain deposits
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink/55">
            <ScanFace className="w-3.5 h-3.5 text-accent" strokeWidth={1.75} />
            AI damage detection
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink/55">
            <Zap className="w-3.5 h-3.5 text-ok" strokeWidth={1.75} />
            Instant settlement
          </span>
        </div>
      </section>

      {/* ── Listings ── */}
      <section id="browse" className="scroll-mt-14 max-w-6xl mx-auto px-4 pb-20">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="mono-label text-ink/70 shrink-0">Inventory</h2>
          <div className="rule flex-1" />
          {listings.length > 0 && (
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink/40 shrink-0">
              {String(listings.length).padStart(2, "0")} item{listings.length !== 1 ? "s" : ""}
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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map((listing, i) => (
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
      </section>
    </>
  )
}
