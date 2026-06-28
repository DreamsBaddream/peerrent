"use client"

import { useState, useEffect } from "react"

declare global {
  interface Window {
    casperWallet?: {
      requestConnection: () => Promise<void>
      getActivePublicKey: () => Promise<string>
      sign: (
        deployJson: string,
        publicKeyHex: string
      ) => Promise<{ signature: string; cancelled: boolean }>
    }
  }
}

function truncateKey(key: string): string {
  if (key.length <= 14) return key
  return `${key.slice(0, 8)}...${key.slice(-6)}`
}

export default function WalletButton() {
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("casper_public_key")
    if (stored) setPublicKey(stored)
  }, [])

  async function connect() {
    if (!window.casperWallet) {
      window.open(
        "https://www.casperwallet.io/",
        "_blank",
        "noopener,noreferrer"
      )
      return
    }

    setLoading(true)
    try {
      await window.casperWallet.requestConnection()
      const key = await window.casperWallet.getActivePublicKey()
      setPublicKey(key)
      localStorage.setItem("casper_public_key", key)
    } catch {
      // user rejected or error
    } finally {
      setLoading(false)
    }
  }

  function disconnect() {
    setPublicKey(null)
    localStorage.removeItem("casper_public_key")
  }

  if (publicKey) {
    return (
      <button
        onClick={disconnect}
        className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-300 hover:bg-gray-700 transition-colors font-mono"
        title={publicKey}
      >
        {truncateKey(publicKey)}
      </button>
    )
  }

  return (
    <button
      onClick={connect}
      disabled={loading}
      className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors disabled:opacity-50"
    >
      {loading ? "Connecting..." : "Connect Wallet"}
    </button>
  )
}
