# PeerRent — Shared Context

## Core Flow

Sign Up → List Item → Browse → Rent → Return → Deposit Released → Rate

## Workspaces

| Workspace | Purpose | Status |
|-----------|---------|--------|
| smart-contract/ | Odra/Rust contract on Casper | pending |
| backend/ | Next.js API routes + Supabase | pending |
| ai-agent/ | Claude API damage + liveness | pending |
| frontend/ | Next.js UI | pending |

## Build Order

1. smart-contract (everything depends on contract addresses)
2. backend (APIs + auth)
3. ai-agent (damage check + liveness endpoints)
4. frontend (wires it all together)

## Environment Variables Needed

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
ANTHROPIC_API_KEY=
CASPER_NODE_URL=
CASPER_CONTRACT_HASH=
X402_FACILITATOR_URL=
```
