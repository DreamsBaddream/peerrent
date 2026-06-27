# Backend Workspace (L1)

Next.js 14 API routes + Supabase for PeerRent.

## What to Load

| Resource | When | Why |
|----------|------|-----|
| `stages/{current}/CONTEXT.md` | Always | Current stage contract |
| `shared/references/tech-stack.md` | Always | Stack decisions |
| `shared/references/casper-api.md` | Stages 03-04 | Casper + x402 integration |
| `shared/references/conventions.md` | Always | Naming rules |

## What NOT to Load

| Resource | Why |
|----------|-----|
| smart-contract/ | Already deployed, only need contract hash |
| frontend/ | Irrelevant to backend |
| ai-agent/ | Called via HTTP, not imported |

## Stage Progression

1. `01-supabase-schema` — Create tables: users, listings, rentals
2. `02-auth` — Phone OTP (Twilio) + selfie liveness API routes
3. `03-listings-api` — CRUD for item listings
4. `04-rental-api` — Rent flow, return flow, x402 payment, ratings
