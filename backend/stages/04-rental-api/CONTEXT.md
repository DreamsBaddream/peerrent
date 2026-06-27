# Stage 04: Rental API

## Input

| Source | What | Why |
|--------|------|-----|
| backend/CONTEXT.md | /api/rent, /api/return, /api/rate routes | What to build |
| shared/references/casper-api.md | x402 + casper-js-sdk patterns | Blockchain calls |
| smart-contract/stages/04-deploy/CONTEXT.md | Contract hash | Which contract to call |

## Process

### Step 1: POST /api/rent/route.ts
- Auth check
- Accept: `{ listingId, startDate, endDate }`
- Calculate days + total deposit
- Call Casper smart contract `rent_item()` — renter locks deposit
- Create rental row in Supabase (status: 'active')
- Mark listing is_available = false
- Return `{ rentalId, txHash }`

### Step 2: POST /api/return/route.ts
- Auth check (must be renter of this rental)
- Accept: `{ rentalId, afterPhotos: File[] }`
- Upload after-photos to Supabase Storage
- Fetch before-photos from rental record
- Call /ai/damage-check with before + after photo URLs
- If no damage: call contract `return_item(item_id, false)` → deposit refunded
- If damage: call contract `return_item(item_id, true)` → deposit held
- Update rental: status = 'returned', damage_detected, after_photos
- Return `{ damageDetected, txHash }`

### Step 3: POST /api/rate/route.ts
- Auth check
- Accept: `{ targetWallet, score: 1-5, rentalId }`
- Validate rental is complete and user was party to it
- Call contract `rate_user(targetWallet, score)`
- Return `{ txHash }`

## Output

3 working API routes covering full rental lifecycle.

## Completion

Backend workspace complete. Proceed to `ai-agent/` workspace.
