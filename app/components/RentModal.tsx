"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

interface RentModalProps {
  listingId: string
  pricePerDay: number
  depositAmount: number
  ownerId?: string
}

const CSPR_USD_FALLBACK = 0.02

export default function RentModal({
  listingId,
  pricePerDay,
  depositAmount,
  ownerId,
}: RentModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [csprUsd, setCsprUsd] = useState<number>(CSPR_USD_FALLBACK)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    setPublicKey(localStorage.getItem("casper_public_key"))
    setUserId(localStorage.getItem("user_id"))
    fetch("https://api.coingecko.com/api/v3/simple/price?ids=casper-network&vs_currencies=usd")
      .then((r) => r.json())
      .then((d) => {
        const price = d?.["casper-network"]?.usd
        if (typeof price === "number" && price > 0) setCsprUsd(price)
      })
      .catch(() => {})
  }, [])

  const days =
    startDate && endDate
      ? Math.max(
          1,
          Math.ceil(
            (new Date(endDate).getTime() - new Date(startDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0

  const total = days * pricePerDay + depositAmount

  async function handleConfirm() {
    if (!startDate || !endDate) {
      toast.error("Please select start and end dates")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/rent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          renterId: userId!,
          startDate,
          endDate,
          renterWallet: publicKey,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? "Failed to create rental")
      }
      toast.success("Rental confirmed!")
      setOpen(false)
      router.push("/dashboard")
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (!userId) {
    return (
      <a
        href="/signup"
        className="w-full py-3 rounded-xl glass text-sm font-semibold text-white/50 hover:text-white hover:border-emerald-500/30 transition-colors flex items-center justify-center"
      >
        Sign in to rent this item
      </a>
    )
  }

  if (ownerId && userId === ownerId) {
    return (
      <div className="w-full py-3 rounded-xl glass text-white/30 text-sm font-semibold flex items-center justify-center">
        This is your listing
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3.5 rounded-xl btn-gradient text-sm"
      >
        Rent This Item
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="card rounded-2xl p-6 w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-base font-semibold">Confirm Rental</h2>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg glass flex items-center justify-center text-white/40 hover:text-white transition-colors"
              >
                <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="2">
                  <path d="M2 2l10 10M12 2L2 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="field w-full rounded-xl px-3 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || new Date().toISOString().split("T")[0]}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="field w-full rounded-xl px-3 py-2.5 text-sm"
                  />
                </div>
              </div>

              {/* Price summary */}
              {days > 0 && (
                <div className="glass rounded-xl p-4 space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">
                      {days} day{days !== 1 ? "s" : ""} × {pricePerDay} CSPR
                    </span>
                    <div className="text-right">
                      <span className="text-white">{days * pricePerDay} CSPR</span>
                      <span className="block text-xs text-white/30">
                        ~${(days * pricePerDay * csprUsd).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Security deposit</span>
                    <div className="text-right">
                      <span className="text-white">{depositAmount} CSPR</span>
                      <span className="block text-xs text-white/30">
                        ~${(depositAmount * csprUsd).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="h-px bg-white/[0.07]" />
                  <div className="flex justify-between">
                    <span className="text-white font-semibold text-sm">Total</span>
                    <div className="text-right">
                      <span className="gradient-text font-bold text-sm">{total} CSPR</span>
                      <span className="block text-xs text-white/30">
                        ~${(total * csprUsd).toFixed(2)} USD
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {!publicKey && (
                <p className="text-amber-400/80 text-xs bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
                  Connect your Casper Wallet to proceed.
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-2.5 rounded-xl glass text-white/50 hover:text-white text-sm transition-colors"
              >
                Cancel
              </button>
              {publicKey ? (
                <button
                  onClick={handleConfirm}
                  disabled={loading || !startDate || !endDate}
                  className="flex-1 py-2.5 rounded-xl btn-gradient text-sm"
                >
                  {loading ? "Processing…" : "Confirm Rental"}
                </button>
              ) : (
                <button
                  onClick={() => {
                    setOpen(false)
                    document.querySelector<HTMLButtonElement>("[data-wallet-btn]")?.click()
                  }}
                  className="flex-1 py-2.5 rounded-xl btn-gradient text-sm"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
