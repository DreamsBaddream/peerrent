"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { X } from "lucide-react"
import { useCsprPrice, formatUsd } from "@/components/CsprPrice"

interface RentModalProps {
  listingId: string
  pricePerDay: number
  depositAmount: number
  ownerId?: string
}

export default function RentModal({
  listingId,
  pricePerDay,
  depositAmount,
  ownerId,
}: RentModalProps) {
  const router = useRouter()
  const { usd: csprUsd } = useCsprPrice()
  const [open, setOpen] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    setPublicKey(localStorage.getItem("casper_public_key"))
    setUserId(localStorage.getItem("user_id"))
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open])

  function applyPreset(numDays: number) {
    const start = new Date()
    const end = new Date()
    end.setDate(end.getDate() + numDays)
    setStartDate(start.toISOString().split("T")[0])
    setEndDate(end.toISOString().split("T")[0])
  }

  const presets = [
    { label: "1 day", days: 1 },
    { label: "3 days", days: 3 },
    { label: "1 week", days: 7 },
  ]

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
        className="btn-line w-full py-3 flex items-center justify-center"
      >
        Sign in to rent this item
      </a>
    )
  }

  if (ownerId && userId === ownerId) {
    return (
      <div className="w-full py-3 border border-dashed border-ink/40 font-mono text-xs uppercase tracking-[0.1em] text-ink/45 flex items-center justify-center">
        This is your listing
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-accent w-full py-3.5"
      >
        Rent This Item
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Rental order"
            className="card-log p-6 w-full max-w-md bg-paper2"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-ink text-base uppercase tracking-tight">
                Rental Order
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 border border-ink/40 flex items-center justify-center text-ink/50 hover:text-ink hover:border-ink transition-colors"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mono-label block mb-1.5">Quick Select</label>
                <div className="flex gap-2">
                  {presets.map((p) => {
                    const isActive = days === p.days && !!startDate
                    return (
                      <button
                        key={p.days}
                        type="button"
                        onClick={() => applyPreset(p.days)}
                        className={`flex-1 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] py-2 border transition-all ${
                          isActive
                            ? "bg-ink border-ink text-paper2 shadow-[2px_2px_0_#e04a00]"
                            : "border-ink/35 text-ink/60 hover:border-ink hover:text-ink"
                        }`}
                      >
                        {p.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mono-label block mb-1.5">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="field w-full px-3 py-2.5 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="mono-label block mb-1.5">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || new Date().toISOString().split("T")[0]}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="field w-full px-3 py-2.5 text-sm font-mono"
                  />
                </div>
              </div>

              {days > 0 && (
                <div className="border border-ink bg-paper p-4 space-y-2.5 font-mono">
                  <div className="flex justify-between text-sm">
                    <span className="text-ink/60">
                      {days} day{days !== 1 ? "s" : ""} × {pricePerDay} CSPR
                    </span>
                    <div className="text-right">
                      <span className="text-ink">{days * pricePerDay} CSPR</span>
                      <span className="block text-[10px] text-ink/40">
                        ~{formatUsd(days * pricePerDay * csprUsd)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink/60">Security deposit</span>
                    <div className="text-right">
                      <span className="text-ink">{depositAmount} CSPR</span>
                      <span className="block text-[10px] text-ink/40">
                        ~{formatUsd(depositAmount * csprUsd)}
                      </span>
                    </div>
                  </div>
                  <div className="rule-solid" />
                  <div className="flex justify-between">
                    <span className="text-ink font-bold text-sm uppercase tracking-wide">Total</span>
                    <div className="text-right">
                      <span className="text-accent font-bold text-sm">{total} CSPR</span>
                      <span className="block text-[10px] text-ink/40">
                        ~{formatUsd(total * csprUsd)} USD
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {!publicKey && (
                <p className="font-mono text-[11px] text-warn border border-warn/50 bg-warn/5 px-3 py-2">
                  Connect your Casper Wallet to proceed.
                </p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setOpen(false)}
                className="btn-line flex-1 py-2.5"
              >
                Cancel
              </button>
              {publicKey ? (
                <button
                  onClick={handleConfirm}
                  disabled={loading || !startDate || !endDate}
                  className="btn-accent flex-1 py-2.5"
                >
                  {loading ? "Processing…" : "Confirm"}
                </button>
              ) : (
                <button
                  onClick={() => {
                    setOpen(false)
                    document.querySelector<HTMLButtonElement>("[data-wallet-btn]")?.click()
                  }}
                  className="btn-ink flex-1 py-2.5"
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
