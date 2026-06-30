"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface UserProfile {
  id: string
  phone: string
  selfie_url: string | null
  verified: boolean
  wallet_address: string | null
  created_at: string
  listing_count: number
  rental_count: number
  avg_rating: number | null
  rating_count: number
}

function maskPhone(phone: string) {
  if (phone.length <= 4) return phone
  const last4 = phone.slice(-4)
  const prefix = phone.slice(0, 3)
  return `${prefix} *** *** ${last4}`
}

function memberSince(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

function StarRating({ avg, count }: { avg: number | null; count: number }) {
  if (avg === null) {
    return <p className="text-white/25 text-sm">No ratings yet</p>
  }
  const rounded = Math.round(avg * 10) / 10
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg key={star} viewBox="0 0 16 16" className="w-4 h-4" fill={star <= Math.round(avg) ? "url(#star-grad)" : "none"} stroke={star <= Math.round(avg) ? "none" : "currentColor"} strokeWidth="1.2">
            <defs>
              <linearGradient id="star-grad" x1="0" y1="0" x2="16" y2="16" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
            <path strokeLinecap="round" strokeLinejoin="round" className="text-white/15" d="M8 1.5l1.8 3.6 4 .58-2.9 2.83.68 3.99L8 10.35l-3.58 1.88.68-3.99L2.2 5.68l4-.58L8 1.5z" />
          </svg>
        ))}
      </div>
      <span className="text-white font-semibold text-sm">{rounded}</span>
      <span className="text-white/30 text-xs">({count} {count === 1 ? "rating" : "ratings"})</span>
    </div>
  )
}

export default function ProfilePage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [localWallet, setLocalWallet] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = localStorage.getItem("user_id")
    const wallet = localStorage.getItem("casper_public_key")
    setUserId(id)
    setLocalWallet(wallet)
    if (id) {
      fetch(`/api/users/${id}`)
        .then((r) => r.json())
        .then((data) => {
          if (!data.error) setProfile(data)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  if (!userId) {
    return (
      <div className="max-w-md mx-auto px-4 py-32 text-center">
        <div className="card rounded-2xl p-10">
          <div className="w-14 h-14 rounded-full glass flex items-center justify-center mx-auto mb-5">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white/30" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <p className="text-white font-semibold mb-1">Sign in to view your profile</p>
          <p className="text-white/35 text-sm mb-6">Your identity, wallet, and stats in one place.</p>
          <Link href="/signup" className="inline-block px-6 py-3 rounded-xl btn-gradient text-sm">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-4">
        <div className="card rounded-2xl h-56 animate-pulse" />
        <div className="card rounded-2xl h-28 animate-pulse" />
        <div className="card rounded-2xl h-28 animate-pulse" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto px-4 py-32 text-center">
        <p className="text-white/40 text-sm">Could not load profile.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-4">

      {/* Identity card */}
      <div className="card rounded-2xl p-6">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            {profile.selfie_url ? (
              <img
                src={profile.selfie_url}
                alt="Your selfie"
                className="w-20 h-20 rounded-full object-cover ring-2 ring-white/[0.08]"
              />
            ) : (
              <div className="w-20 h-20 rounded-full glass flex items-center justify-center ring-2 ring-white/[0.08]">
                <svg viewBox="0 0 24 24" fill="none" className="w-9 h-9 text-white/25" stroke="currentColor" strokeWidth="1.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
            )}
            {/* Verified dot */}
            {profile.verified && (
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-400 flex items-center justify-center ring-2 ring-[#030712]">
                <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 5.5l2 2 4-4" />
                </svg>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-white font-semibold text-lg">{maskPhone(profile.phone)}</span>
              {profile.verified ? (
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                  Identity Verified
                </span>
              ) : (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  Unverified
                </span>
              )}
            </div>
            <p className="text-white/30 text-xs mb-3">Member since {memberSince(profile.created_at)}</p>
            {!profile.verified && (
              <Link
                href="/signup"
                className="inline-block text-xs px-3 py-1.5 rounded-lg btn-gradient"
              >
                Complete verification →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card rounded-2xl p-5 text-center">
          <p className="text-3xl font-bold gradient-text mb-1">{profile.listing_count}</p>
          <p className="text-white/35 text-xs uppercase tracking-wider">Listed</p>
        </div>
        <div className="card rounded-2xl p-5 text-center">
          <p className="text-3xl font-bold gradient-text mb-1">{profile.rental_count}</p>
          <p className="text-white/35 text-xs uppercase tracking-wider">Rented</p>
        </div>
        <div className="card rounded-2xl p-5 text-center">
          <p className="text-3xl font-bold gradient-text mb-1">
            {profile.avg_rating !== null ? (Math.round(profile.avg_rating * 10) / 10).toFixed(1) : "—"}
          </p>
          <p className="text-white/35 text-xs uppercase tracking-wider">Avg Rating</p>
        </div>
      </div>

      {/* Rating */}
      <div className="card rounded-2xl p-5">
        <p className="text-xs text-white/35 uppercase tracking-wider mb-3">Your Rating</p>
        <StarRating avg={profile.avg_rating} count={profile.rating_count} />
        {profile.avg_rating === null && !localWallet && (
          <p className="text-white/20 text-xs mt-1">Connect your wallet so others can rate you after rentals.</p>
        )}
      </div>

      {/* Wallet */}
      {(() => {
        const wallet = localWallet || profile.wallet_address
        return (
          <div className="card rounded-2xl p-5">
            <p className="text-xs text-white/35 uppercase tracking-wider mb-3">Casper Wallet</p>
            {wallet ? (
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-sm text-white/70 truncate">
                  {wallet.slice(0, 12)}…{wallet.slice(-8)}
                </span>
                <a
                  href={`https://testnet.cspr.live/account/${wallet}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-xs text-emerald-400/70 hover:text-emerald-400 transition-colors"
                >
                  View ↗
                </a>
              </div>
            ) : (
              <p className="text-white/25 text-sm">
                No wallet connected.{" "}
                <span className="text-white/40">Connect your Casper Wallet to rent or list items.</span>
              </p>
            )}
          </div>
        )
      })()}

      {/* Account ID */}
      <div className="card rounded-2xl p-5">
        <p className="text-xs text-white/35 uppercase tracking-wider mb-2">Account ID</p>
        <p className="font-mono text-xs text-white/30 break-all">{profile.id}</p>
      </div>

      {/* Quick links */}
      <div className="flex gap-3">
        <Link href="/dashboard" className="flex-1 text-center py-3 rounded-xl glass text-sm text-white/50 hover:text-white transition-colors">
          Dashboard
        </Link>
        <Link href="/list" className="flex-1 text-center py-3 rounded-xl glass text-sm text-white/50 hover:text-white transition-colors">
          List an Item
        </Link>
      </div>
    </div>
  )
}
