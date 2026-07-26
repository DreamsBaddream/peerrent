"use client"

import { createContext, useContext, useEffect, useState } from "react"

const FALLBACK_USD = 0.02
const CACHE_KEY = "cspr_usd_rate"
const TTL_MS = 10 * 60 * 1000

type PriceState = { usd: number; live: boolean }

const CsprPriceContext = createContext<PriceState>({ usd: FALLBACK_USD, live: false })

export function CsprPriceProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PriceState>({ usd: FALLBACK_USD, live: false })

  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const { usd, ts } = JSON.parse(cached)
        if (typeof usd === "number" && usd > 0) {
          setState({ usd, live: true })
          if (Date.now() - ts < TTL_MS) return
        }
      }
    } catch {}

    fetch("https://api.coingecko.com/api/v3/simple/price?ids=casper-network&vs_currencies=usd")
      .then((r) => r.json())
      .then((d) => {
        const usd = d?.["casper-network"]?.usd
        if (typeof usd === "number" && usd > 0) {
          setState({ usd, live: true })
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ usd, ts: Date.now() }))
          } catch {}
        }
      })
      .catch(() => {})
  }, [])

  return <CsprPriceContext.Provider value={state}>{children}</CsprPriceContext.Provider>
}

export function useCsprPrice() {
  return useContext(CsprPriceContext)
}

export function formatUsd(n: number): string {
  if (!isFinite(n) || n <= 0) return "$0"
  if (n < 0.01) return "<$0.01"
  if (n >= 1000) return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 })
  return "$" + n.toFixed(2)
}

interface UsdEstimateProps {
  cspr: number
  per?: string
  className?: string
}

export default function UsdEstimate({ cspr, per, className = "" }: UsdEstimateProps) {
  const { usd } = useCsprPrice()
  const value = cspr * usd
  return (
    <span
      className={`font-mono text-ink/40 tabular-nums ${className}`}
      title="Estimated USD value at current CSPR price"
    >
      ~{formatUsd(value)}
      {per ? `/${per}` : ""}
    </span>
  )
}
