export interface Listing {
  id: string
  owner_id: string
  title: string
  description: string
  price_per_day: number
  deposit_amount: number
  photos: string[]
  casper_item_id: string | null
  is_available: boolean
  created_at: string
}

export interface Rental {
  id: string
  listing_id: string
  renter_id: string
  start_date: string
  end_date: string
  before_photos: string[]
  after_photos: string[]
  status: "active" | "returned" | "disputed"
  damage_detected: boolean | null
  created_at: string
}

export interface User {
  id: string
  phone: string
  wallet_address: string | null
  selfie_url: string | null
  verified: boolean
  created_at: string
}

export interface DamageCheckResult {
  damaged: boolean
  reason: string
  severity: 'none' | 'minor' | 'major'
}

export interface LivenessResult {
  isLive: boolean
  reason: string
}
