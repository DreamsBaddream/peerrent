import Link from "next/link"
import { ExternalLink } from "lucide-react"

const CONTRACT_PACKAGE = "d086038b1cedd634d8c6789fe0f785a037d18ec3bd4d909c50624585f8ff83f5"

export default function Footer() {
  return (
    <footer className="border-t border-ink bg-paper2 mt-auto">
      <div className="max-w-6xl mx-auto px-5 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="PeerRent"
              width={22}
              height={22}
              className="w-[22px] h-[22px] object-contain shrink-0"
            />
            <span className="font-display text-[13px] tracking-tight leading-none">
              PEER<span className="text-accent">RENT</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink/50">
            <Link href="/" className="hover:text-ink transition-colors">Browse</Link>
            <Link href="/list" className="hover:text-ink transition-colors">List Item</Link>
            <Link href="/dashboard" className="hover:text-ink transition-colors">Dashboard</Link>
            <a
              href={`https://testnet.cspr.live/contract-package/${CONTRACT_PACKAGE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-accent/80 hover:text-accent transition-colors"
            >
              Contract on Testnet
              <ExternalLink className="w-2.5 h-2.5" strokeWidth={2} />
            </a>
          </div>
        </div>

        <div className="rule mt-6 mb-4" />
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink/35">
          Deposits locked on Casper · Returns inspected by AI · Built for the Casper Agentic Buildathon
        </p>
      </div>
    </footer>
  )
}
