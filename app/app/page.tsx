import ItemCard from "@/components/ItemCard"
import { Listing } from "@/lib/types"
import Link from "next/link"

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

const FEATURES = [
  {
    label: "Blockchain Secured",
    desc: "Deposits locked on-chain via Casper smart contract",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 text-emerald-400" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    label: "AI Damage Detection",
    desc: "Gemini Vision inspects every return automatically",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 text-cyan-400" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
  },
  {
    label: "Instant Settlement",
    desc: "Deposits released in seconds, not days",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 text-emerald-400" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    label: "Zero Middlemen",
    desc: "Lender and renter transact directly on-chain",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 text-cyan-400" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003-6.72c0-5.523-4.477-10-10-10S1 6.477 1 12c0 2.56 1.006 4.876 2.638 6.568M15.75 15.75L18 18" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12a6 6 0 1012 0 6 6 0 00-12 0z" />
      </svg>
    ),
  },
]

export default async function HomePage() {
  const listings = await getListings()

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 pt-24 pb-20 overflow-hidden">
        {/* Testnet pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass mb-10 text-xs text-white/55">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live on Casper Testnet
        </div>

        {/* Headline */}
        <h1 className="hero-text text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.04] mb-6 max-w-4xl">
          Borrow Anything.<br />From Anyone.
        </h1>

        {/* Sub-headline */}
        <p className="text-white/45 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
          The first peer-to-peer rental marketplace secured by Casper Network.
          Lock deposits on-chain. AI verifies returns. Zero middlemen.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link
            href="#browse"
            className="px-8 py-3.5 rounded-xl btn-gradient text-sm"
          >
            Browse Items
          </Link>
          <Link
            href="/list"
            className="px-8 py-3.5 rounded-xl glass text-sm font-semibold text-white hover:bg-white/[0.07] transition-colors"
          >
            List an Item
          </Link>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 max-w-3xl">
          {FEATURES.map((f) => (
            <div
              key={f.label}
              className="flex items-start gap-2.5 bg-white/[0.04] border border-white/[0.07] hover:border-emerald-500/20 rounded-xl px-4 py-3 text-left transition-colors duration-200"
            >
              <span className="mt-px shrink-0">{f.icon}</span>
              <div>
                <div className="text-xs font-semibold text-white">{f.label}</div>
                <div className="text-xs text-white/35 mt-0.5">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Listings ── */}
      <section id="browse" className="scroll-mt-20 max-w-6xl mx-auto px-4 pb-20">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
            Available Now
          </h2>
          <div className="flex-1 h-px bg-white/[0.06]" />
          {listings.length > 0 && (
            <span className="text-xs text-white/25">{listings.length} items</span>
          )}
        </div>

        {listings.length === 0 ? (
          <div className="card rounded-2xl flex flex-col items-center justify-center py-28 text-center">
            <div className="w-12 h-12 rounded-full glass flex items-center justify-center mb-5">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white/25" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
              </svg>
            </div>
            <p className="text-white/40 text-sm mb-1">No items listed yet.</p>
            <p className="text-white/20 text-xs mb-6">Be the first to list something.</p>
            <Link
              href="/list"
              className="px-5 py-2.5 rounded-xl btn-gradient text-sm"
            >
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
