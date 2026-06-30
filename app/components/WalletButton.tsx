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
  return `${key.slice(0, 8)}…${key.slice(-6)}`
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
        className="px-3 py-1.5 rounded-lg glass font-mono text-xs text-white/55 hover:text-red-400 hover:border-red-500/25 transition-colors"
        title="Click to disconnect"
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
      className="px-4 py-2 rounded-lg btn-gradient text-sm"
    >
      {loading ? "Connecting…" : "Connect Wallet"}
    </button>
  )
}
