"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import WalletButton from "./WalletButton"

export default function Navbar() {
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    setVerified(!!localStorage.getItem("user_id"))
  }, [])

  return (
    <nav className="sticky top-0 z-50 bg-gray-950 border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold text-white tracking-tight hover:text-emerald-400 transition-colors"
        >
          PeerRent
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Browse
          </Link>
          <Link
            href="/list"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            List Item
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Dashboard
          </Link>
          {!verified ? (
            <Link
              href="/signup"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Sign In
            </Link>
          ) : (
            <button
              onClick={() => {
                localStorage.removeItem("user_id")
                localStorage.removeItem("casper_public_key")
                sessionStorage.setItem("wallet_disconnected", "1")
                setVerified(false)
                window.location.href = "/"
              }}
              className="text-sm text-gray-400 hover:text-red-400 transition-colors"
            >
              Sign Out
            </button>
          )}
          <WalletButton />
        </div>
      </div>
    </nav>
  )
}
