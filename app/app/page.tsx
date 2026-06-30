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
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-10">
        {/* Testnet pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live on Casper Testnet
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] mb-4 max-w-xl">
          <span className="text-white">Borrow anything.</span>
          <br />
          <span className="gradient-text">From anyone.</span>
        </h1>

        {/* Sub-headline */}
        <p className="text-white/45 text-base max-w-lg mb-7 leading-relaxed">
          Rent cameras, bikes, tools — from people near you.
          Deposits locked on-chain. Returns checked by AI.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Link
            href="#browse"
            className="px-6 py-2.5 rounded-xl btn-gradient text-sm inline-flex items-center gap-2"
          >
            Browse Items
            <ArrowRight className="w-4 h-4" strokeWidth={2.25} />
          </Link>
          <Link
            href="/list"
            className="px-6 py-2.5 rounded-xl glass text-sm font-semibold text-white/60 hover:text-white transition-colors"
          >
            List an Item
          </Link>
        </div>

        {/* Trust markers */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="flex items-center gap-1.5 text-xs text-white/35">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.75} />
            On-chain deposits
          </span>
          <span className="flex items-center gap-1.5 text-xs text-white/35">
            <ScanFace className="w-3.5 h-3.5 text-cyan-400" strokeWidth={1.75} />
            AI damage detection
          </span>
          <span className="flex items-center gap-1.5 text-xs text-white/35">
            <Zap className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.75} />
            Instant settlement
          </span>
        </div>
      </section>

      {/* ── Listings ── */}
      <section id="browse" className="scroll-mt-14 max-w-6xl mx-auto px-4 pb-20">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest shrink-0">
            Available Now
          </h2>
          <div className="flex-1 h-px bg-white/[0.06]" />
          {listings.length > 0 && (
            <span className="text-xs text-white/25 shrink-0">
              {listings.length} item{listings.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {listings.length === 0 ? (
          <div className="card rounded-2xl flex flex-col items-center justify-center py-28 text-center">
            <div className="w-12 h-12 rounded-full glass flex items-center justify-center mb-5">
              <Package className="w-5 h-5 text-white/25" strokeWidth={1.5} />
            </div>
            <p className="text-white/40 text-sm mb-1">No items listed yet.</p>
            <p className="text-white/20 text-xs mb-6">Be the first to list something.</p>
            <Link href="/list" className="px-5 py-2.5 rounded-xl btn-gradient text-sm">
              List an Item
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map((listing) => (
              <ItemCard
                key={listing.id}
                id={listing.id}
                title={listing.title}
                photos={listing.photos}
                price_per_day={listing.price_per_day}
                deposit_amount={listing.deposit_amount}
              />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
