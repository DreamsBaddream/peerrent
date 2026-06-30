"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import WalletButton from "./WalletButton"
import { LogOut } from "lucide-react"

export default function Navbar() {
  const [verified, setVerified] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setVerified(!!localStorage.getItem("user_id"))
  }, [])

  const navLinks = [
    { href: "/", label: "Browse" },
    { href: "/list", label: "List Item" },
    { href: "/dashboard", label: "Dashboard" },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#030712]/88 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <svg viewBox="0 0 22 22" width="20" height="20" fill="none" aria-hidden="true">
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
          <span className="text-[15px] font-bold tracking-tight">
            <span className="gradient-text">Peer</span>
            <span className="text-white">Rent</span>
          </span>
        </Link>

        {/* Center nav links */}
        <div className="hidden sm:flex items-center gap-0.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                  isActive
                    ? "text-white bg-white/[0.07]"
                    : "text-white/40 hover:text-white/75 hover:bg-white/[0.04]"
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {!verified ? (
            <Link href="/signup" className="text-sm px-4 py-1.5 rounded-lg btn-gradient">
              Sign In
            </Link>
          ) : (
            <>
              <Link
                href="/profile"
                className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                  pathname === "/profile"
                    ? "text-white bg-white/[0.07]"
                    : "text-white/40 hover:text-white/75 hover:bg-white/[0.04]"
                }`}
              >
                Profile
              </Link>
              <WalletButton />
              <button
                onClick={() => {
                  localStorage.removeItem("user_id")
                  localStorage.removeItem("casper_public_key")
                  sessionStorage.setItem("wallet_disconnected", "1")
                  setVerified(false)
                  window.location.href = "/"
                }}
                className="p-1.5 rounded-lg text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
