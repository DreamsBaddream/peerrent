import InventoryBrowser from "@/components/InventoryBrowser"
import { Listing } from "@/lib/types"
import Link from "next/link"
import Image from "next/image"
import { ShieldCheck, Zap, ScanFace, ArrowRight } from "lucide-react"

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
      <section className="relative overflow-hidden">
        {/* hero background image */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="/hero-orb.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-right"
          />
          {/* paper scrim: solid over the copy (left), clears toward the orb (right) */}
          <div className="absolute inset-0 bg-gradient-to-r from-paper via-paper/90 to-paper/40" />
        </div>

        <div className="max-w-6xl mx-auto px-4 pt-12 pb-12">
          <div className="stamp stamp-ok stamp-tilt mb-7 rise">
            <span className="w-1.5 h-1.5 bg-ok animate-pulse" />
            Live on Casper Testnet
          </div>

          <h1 className="font-display text-4xl md:text-6xl uppercase leading-[0.95] tracking-tight mb-5 max-w-2xl rise rise-1">
            Borrow anything.
            <br />
            <span className="text-accent">From anyone.</span>
          </h1>

          <div className="rule-solid max-w-xs mb-5 rise rise-2" />

          <p className="text-ink/65 text-base max-w-lg mb-8 leading-relaxed rise rise-2">
            Rent cameras, bikes, tools — from people near you.
            Deposits locked on-chain. Returns inspected by AI.
          </p>

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
        </div>
      </section>

      <section id="browse" className="scroll-mt-14 max-w-6xl mx-auto px-4 pb-20">
        <InventoryBrowser listings={listings} />
      </section>
    </>
  )
}
