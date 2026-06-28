"use client"

import { useState, useEffect } from "react"
import toast from "react-hot-toast"

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
  return `${key.slice(0, 8)}...${key.slice(-6)}`
}

export default function WalletButton() {
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Don't auto-restore if user explicitly disconnected this session
    if (sessionStorage.getItem(WALLET_DISCONNECTED)) return
    const stored = localStorage.getItem("casper_public_key")
    if (stored) setPublicKey(stored)
  }, [])

  async function connect() {
    if (!window.CasperWalletProvider) {
      toast.error(
        "Casper Wallet extension not found. Install it at casperwallet.io",
        { duration: 5000 }
      )
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
        className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-300 hover:bg-red-900/40 hover:border-red-700 hover:text-red-300 transition-colors font-mono"
        title="Click to disconnect wallet"
      >
        {truncateKey(publicKey)}
      </button>
    )
  }

  return (
    <button
      data-wallet-btn
      onClick={connect}
      disabled={loading}
      className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors disabled:opacity-50"
    >
      {loading ? "Connecting..." : "Connect Wallet"}
    </button>
  )
}
