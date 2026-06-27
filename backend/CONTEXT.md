# Backend — Context

## Purpose
Next.js API routes (App Router) + Supabase for all off-chain data. Bridges frontend, smart contract, and AI agent.

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| /api/auth/send-otp | POST | Send SMS OTP via Twilio |
| /api/auth/verify-otp | POST | Verify OTP, create session |
| /api/auth/liveness | POST | Check selfie liveness via Claude |
| /api/listings | GET | Fetch all available listings |
| /api/listings | POST | Create new listing |
| /api/listings/[id] | GET | Get single listing |
| /api/rent | POST | Initiate rental, trigger escrow tx |
| /api/return | POST | Upload after-photo, trigger damage check |
| /api/rate | POST | Submit rating |

## Supabase Tables

### users
```sql
id uuid PRIMARY KEY
phone text UNIQUE
wallet_address text UNIQUE
selfie_url text
verified boolean DEFAULT false
created_at timestamptz DEFAULT now()
```

### listings
```sql
id uuid PRIMARY KEY
owner_id uuid REFERENCES users(id)
title text
description text
price_per_day numeric
deposit_amount numeric
photos text[]  -- array of Supabase Storage URLs
casper_item_id text  -- on-chain RWA token id
is_available boolean DEFAULT true
created_at timestamptz DEFAULT now()
```

### rentals
```sql
id uuid PRIMARY KEY
listing_id uuid REFERENCES listings(id)
renter_id uuid REFERENCES users(id)
start_date date
end_date date
before_photos text[]
after_photos text[]
status text  -- 'active' | 'returned' | 'disputed'
damage_detected boolean
created_at timestamptz DEFAULT now()
```

## Current Stage
→ Start at `stages/01-supabase-schema/`
