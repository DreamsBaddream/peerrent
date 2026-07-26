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

        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <img
            src="/logo.png"
            alt="PeerRent"
            width={26}
            height={26}
            className="w-[26px] h-[26px] object-contain shrink-0"
          />
          <span className="font-display text-[15px] tracking-tight leading-none">
            PEER<span className="text-accent">RENT</span>
          </span>
          <span className="hidden md:inline mono-label border-l border-ink/25 pl-2.5">
            Field Ledger
          </span>
        </Link>

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

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="sm:hidden p-1.5 border border-ink/40 text-ink"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

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
