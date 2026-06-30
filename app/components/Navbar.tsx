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
    <nav className="sticky top-0 z-50 glass border-b border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <svg viewBox="0 0 22 22" width="22" height="22" fill="none" aria-hidden="true">
            <circle cx="11" cy="3.5" r="2.5" fill="url(#nav-grad)" />
            <circle cx="19" cy="16"  r="2.5" fill="url(#nav-grad)" />
            <circle cx="3"  cy="16"  r="2.5" fill="url(#nav-grad)" />
            <path
              d="M11 6L18 13.5M11 6L4 13.5M4 13.5L18 13.5"
              stroke="url(#nav-grad)"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="nav-grad" x1="3" y1="3.5" x2="19" y2="18.5" gradientUnits="userSpaceOnUse">
                <stop offset="0%"   stopColor="#34d399" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
          </svg>
          <span className="text-lg font-bold tracking-tight">
            <span className="gradient-text">Peer</span>
            <span className="text-white">Rent</span>
          </span>
        </Link>

        {/* Links + actions */}
        <div className="flex items-center gap-6">
          <Link href="/"          className="text-sm text-white/45 hover:text-white transition-colors">Browse</Link>
          <Link href="/list"      className="text-sm text-white/45 hover:text-white transition-colors">List Item</Link>
          <Link href="/dashboard" className="text-sm text-white/45 hover:text-white transition-colors">Dashboard</Link>

          <div className="w-px h-4 bg-white/10" />

          {!verified ? (
            <Link
              href="/signup"
              className="text-sm px-4 py-2 rounded-lg btn-gradient"
            >
              Sign In
            </Link>
          ) : (
            <>
              <Link href="/profile" className="text-sm text-white/45 hover:text-white transition-colors">Profile</Link>
              <WalletButton />
              <button
                onClick={() => {
                  localStorage.removeItem("user_id")
                  localStorage.removeItem("casper_public_key")
                  sessionStorage.setItem("wallet_disconnected", "1")
                  setVerified(false)
                  window.location.href = "/"
                }}
                className="text-sm text-white/35 hover:text-red-400 transition-colors"
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
