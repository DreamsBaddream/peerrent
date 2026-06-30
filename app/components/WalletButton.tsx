"use client"

import { useState, useEffect } from "react"
import toast from "react-hot-toast"
import { Wallet, Loader2 } from "lucide-react"

declare global {
  interface Window {
    CasperWalletProvider?: () => {
      requestConnection: () => Promise<boolean>
      getActivePublicKey: () => Promise<string>
      sign: (
        deployJson: string,
        publicKeyHex: string
      ) => Promise<{ signature: string; cancelled: boolean }>
    }
  }
}

const WALLET_DISCONNECTED = "wallet_disconnected"

function truncateKey(key: string): string {
  if (key.length <= 14) return key
  return `${key.slice(0, 6)}…${key.slice(-4)}`
}

export default function WalletButton() {
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(WALLET_DISCONNECTED)) return
    const stored = localStorage.getItem("casper_public_key")
    if (stored) setPublicKey(stored)
  }, [])

  async function connect() {
    if (!window.CasperWalletProvider) {
      toast.error("Casper Wallet extension not found. Install it at casperwallet.io", {
        duration: 5000,
      })
      return
    }
    setLoading(true)
    try {
      sessionStorage.removeItem(WALLET_DISCONNECTED)
      const provider = window.CasperWalletProvider()
      await provider.requestConnection()
      const key = await provider.getActivePublicKey()
      setPublicKey(key)
      localStorage.setItem("casper_public_key", key)
      const userId = localStorage.getItem("user_id")
      if (userId) {
        fetch(`/api/users/${userId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet_address: key }),
        }).catch(() => {})
      }
    } catch {
      toast.error("Wallet connection rejected or failed.")
    } finally {
      setLoading(false)
    }
  }

  function disconnect() {
    sessionStorage.setItem(WALLET_DISCONNECTED, "1")
    setPublicKey(null)
    localStorage.removeItem("casper_public_key")
  }

  if (publicKey) {
    return (
      <button
        onClick={disconnect}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass font-mono text-xs text-white/55 hover:text-red-400 hover:border-red-500/25 transition-colors"
        title="Click to disconnect wallet"
      >
        <Wallet className="w-3 h-3 text-emerald-400" strokeWidth={2} />
        {truncateKey(publicKey)}
      </button>
    )
  }

  return (
    <button
      data-wallet-btn
      onClick={connect}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-xs font-semibold text-white/55 hover:text-white transition-colors"
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <Wallet className="w-3 h-3" strokeWidth={2} />
      )}
      {loading ? "Connecting…" : "Connect Wallet"}
    </button>
  )
}
