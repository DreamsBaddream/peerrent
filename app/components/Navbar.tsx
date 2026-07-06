"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import WalletButton from "./WalletButton"
import { LogOut, Menu, X } from "lucide-react"

export default function Navbar() {
  const [verified, setVerified] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setVerified(!!localStorage.getItem("user_id"))
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const navLinks = [
    { href: "/", label: "Browse" },
    { href: "/list", label: "List Item" },
    { href: "/dashboard", label: "Dashboard" },
  ]

  function signOut() {
    localStorage.removeItem("user_id")
    localStorage.removeItem("casper_public_key")
    sessionStorage.setItem("wallet_disconnected", "1")
    setVerified(false)
    window.location.href = "/"
  }

  return (
    <nav className="sticky top-0 z-50 bg-paper2 border-b border-ink">
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <svg viewBox="0 0 22 22" width="20" height="20" fill="none" aria-hidden="true">
            <circle cx="11" cy="3.5" r="2.5" fill="#e04a00" />
            <circle cx="19" cy="16" r="2.5" fill="#1c1a13" />
            <circle cx="3" cy="16" r="2.5" fill="#1c1a13" />
            <path
              d="M11 6L18 13.5M11 6L4 13.5M4 13.5L18 13.5"
              stroke="#1c1a13"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
          <span className="font-display text-[15px] tracking-tight leading-none">
            PEER<span className="text-accent">RENT</span>
          </span>
          <span className="hidden md:inline mono-label border-l border-ink/25 pl-2.5">
            Field Ledger
          </span>
        </Link>

        {/* Center nav links (desktop) */}
        <div className="hidden sm:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-mono text-xs uppercase tracking-[0.1em] px-3 py-1.5 border transition-all ${
                  isActive
                    ? "border-ink bg-ink text-paper2 shadow-[2px_2px_0_#e04a00]"
                    : "border-ink/30 text-ink/60 hover:text-ink hover:border-ink hover:-translate-y-px"
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
            <Link href="/signup" className="btn-accent px-4 py-1.5 text-xs">
              Sign In
            </Link>
          ) : (
            <>
              <Link
                href="/profile"
                className={`hidden sm:block font-mono text-xs uppercase tracking-[0.1em] px-3 py-1.5 border transition-all ${
                  pathname === "/profile"
                    ? "border-ink bg-ink text-paper2 shadow-[2px_2px_0_#e04a00]"
                    : "border-ink/30 text-ink/60 hover:text-ink hover:border-ink hover:-translate-y-px"
                }`}
              >
                Profile
              </Link>
              <WalletButton />
              <button
                onClick={signOut}
                className="hidden sm:block p-1.5 border border-ink/30 text-ink/45 hover:text-err hover:border-err transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="sm:hidden p-1.5 border border-ink/40 text-ink"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div className="sm:hidden border-t border-ink bg-paper2">
          <div className="px-5 py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-mono text-xs uppercase tracking-[0.1em] px-3 py-2.5 border transition-colors ${
                  pathname === link.href
                    ? "border-ink bg-ink text-paper2"
                    : "border-ink/20 text-ink/60"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {verified && (
              <>
                <Link
                  href="/profile"
                  className={`font-mono text-xs uppercase tracking-[0.1em] px-3 py-2.5 border transition-colors ${
                    pathname === "/profile"
                      ? "border-ink bg-ink text-paper2"
                      : "border-ink/20 text-ink/60"
                  }`}
                >
                  Profile
                </Link>
                <button
                  onClick={signOut}
                  className="font-mono text-xs uppercase tracking-[0.1em] px-3 py-2.5 border border-err/40 text-err text-left"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
