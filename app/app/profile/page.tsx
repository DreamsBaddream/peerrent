"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { User, Wallet, ExternalLink, CheckCircle2, Star } from "lucide-react"

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
    return <p className="text-ink/40 text-sm">No ratings yet</p>
  }
  const rounded = Math.round(avg * 10) / 10
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= Math.round(avg) ? "text-accent fill-accent" : "text-ink/20"}`}
            strokeWidth={star <= Math.round(avg) ? 0 : 1.2}
          />
        ))}
      </div>
      <span className="text-ink font-bold text-sm font-mono">{rounded}</span>
      <span className="text-ink/45 text-xs font-mono">({count} {count === 1 ? "rating" : "ratings"})</span>
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
        <div className="card-log p-10">
          <div className="w-14 h-14 border border-ink/30 flex items-center justify-center mx-auto mb-5">
            <User className="w-6 h-6 text-ink/35" strokeWidth={1.5} />
          </div>
          <p className="text-ink font-bold mb-1">Sign in to view your profile</p>
          <p className="text-ink/50 text-sm mb-6">Your identity, wallet, and stats in one place.</p>
          <Link href="/signup" className="btn-accent inline-block px-6 py-3">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-4">
        <div className="card-log h-56 animate-pulse" />
        <div className="card-log h-28 animate-pulse" />
        <div className="card-log h-28 animate-pulse" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto px-4 py-32 text-center">
        <p className="text-ink/50 text-sm">Could not load profile.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-4">

      <div className="card-log p-6">
        <p className="mono-label mb-5">Operator ID Card</p>
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            {profile.selfie_url ? (
              <img
                src={profile.selfie_url}
                alt="Your selfie"
                className="w-20 h-20 object-cover border border-ink"
              />
            ) : (
              <div className="w-20 h-20 border border-ink/40 flex items-center justify-center">
                <User className="w-8 h-8 text-ink/30" strokeWidth={1.2} />
              </div>
            )}
            {profile.verified && (
              <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-ok border border-ink flex items-center justify-center">
                <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5" stroke="#faf8f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 5.5l2 2 4-4" />
                </svg>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-ink font-bold text-lg font-mono">{maskPhone(profile.phone)}</span>
              {profile.verified ? (
                <span className="stamp stamp-ok stamp-tilt">
                  <CheckCircle2 className="w-3 h-3" strokeWidth={2} />
                  Verified
                </span>
              ) : (
                <span className="stamp stamp-warn">Unverified</span>
              )}
            </div>
            <p className="font-mono text-[11px] text-ink/45 mb-3">Member since {memberSince(profile.created_at)}</p>
            {!profile.verified && (
              <Link
                href="/signup"
                className="btn-accent inline-block text-[11px] px-3 py-1.5"
              >
                Complete verification →
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card-log p-5 text-center">
          <p className="font-display text-3xl text-accent mb-1">{profile.listing_count}</p>
          <p className="mono-label">Listed</p>
        </div>
        <div className="card-log p-5 text-center">
          <p className="font-display text-3xl text-accent mb-1">{profile.rental_count}</p>
          <p className="mono-label">Rented</p>
        </div>
        <div className="card-log p-5 text-center">
          <p className="font-display text-3xl text-accent mb-1">
            {profile.avg_rating !== null ? (Math.round(profile.avg_rating * 10) / 10).toFixed(1) : "—"}
          </p>
          <p className="mono-label">Avg Rating</p>
        </div>
      </div>

      <div className="card-log p-5">
        <p className="mono-label mb-3">Your Rating</p>
        <StarRating avg={profile.avg_rating} count={profile.rating_count} />
        {profile.avg_rating === null && !localWallet && (
          <p className="text-ink/35 text-xs mt-2">Connect your wallet so others can rate you after rentals.</p>
        )}
      </div>

      {(() => {
        const wallet = localWallet || profile.wallet_address
        return (
          <div className="card-log p-5">
            <p className="mono-label mb-3">Casper Wallet</p>
            {wallet ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Wallet className="w-4 h-4 text-accent shrink-0" strokeWidth={1.75} />
                  <span className="font-mono text-sm text-ink/75 truncate">
                    {wallet.slice(0, 12)}…{wallet.slice(-8)}
                  </span>
                </div>
                <a
                  href={`https://testnet.cspr.live/account/${wallet}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 flex items-center gap-1 font-mono text-[11px] uppercase tracking-wide text-accent/80 hover:text-accent transition-colors"
                >
                  View
                  <ExternalLink className="w-3 h-3" strokeWidth={1.75} />
                </a>
              </div>
            ) : (
              <p className="text-ink/40 text-sm">
                No wallet connected.{" "}
                <span className="text-ink/55">Connect your Casper Wallet to rent or list items.</span>
              </p>
            )}
          </div>
        )
      })()}

      <div className="card-log p-5">
        <p className="mono-label mb-2">Account ID</p>
        <p className="font-mono text-xs text-ink/45 break-all">{profile.id}</p>
      </div>

      <div className="flex gap-3">
        <Link href="/dashboard" className="btn-line flex-1 text-center py-3">
          Dashboard
        </Link>
        <Link href="/list" className="btn-line flex-1 text-center py-3">
          List an Item
        </Link>
      </div>
    </div>
  )
}
