"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

interface RentModalProps {
  listingId: string
  pricePerDay: number
  depositAmount: number
}

const CSPR_USD_FALLBACK = 0.02

export default function RentModal({
  listingId,
  pricePerDay,
  depositAmount,
}: RentModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [csprUsd, setCsprUsd] = useState<number>(CSPR_USD_FALLBACK)

  useEffect(() => {
    setPublicKey(localStorage.getItem("casper_public_key"))
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

    const userId = localStorage.getItem("user_id")
    if (!userId) {
      toast.error("Please sign up first")
      router.push("/signup")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/rent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          renterId: userId,
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

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition-colors"
      >
        Rent This Item
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-white text-lg font-semibold mb-4">
              Confirm Rental
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || new Date().toISOString().split("T")[0]}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              {days > 0 && (
                <div className="bg-gray-800 rounded-lg p-3 space-y-1 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>
                      {days} day{days !== 1 ? "s" : ""} × {pricePerDay} CSPR
                    </span>
                    <div className="text-right">
                      <span>{days * pricePerDay} CSPR</span>
                      <span className="block text-xs text-gray-500">
                        ~${(days * pricePerDay * csprUsd).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Deposit</span>
                    <div className="text-right">
                      <span>{depositAmount} CSPR</span>
                      <span className="block text-xs text-gray-500">
                        ~${(depositAmount * csprUsd).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between text-white font-semibold pt-1 border-t border-gray-700">
                    <span>Total</span>
                    <div className="text-right">
                      <span>{total} CSPR</span>
                      <span className="block text-xs text-gray-400 font-normal">
                        ~${(total * csprUsd).toFixed(2)} USD
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {!publicKey ? (
                <p className="text-amber-400 text-sm">
                  Connect your Casper Wallet to proceed.
                </p>
              ) : null}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 text-sm transition-colors"
              >
                Cancel
              </button>
              {publicKey ? (
                <button
                  onClick={handleConfirm}
                  disabled={loading || !startDate || !endDate}
                  className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm transition-colors disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Confirm Rental"}
                </button>
              ) : (
                <button
                  onClick={() => {
                    setOpen(false)
                    document
                      .querySelector<HTMLButtonElement>("[data-wallet-btn]")
                      ?.click()
                  }}
                  className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm transition-colors"
                >
                  Connect Wallet to Rent
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
