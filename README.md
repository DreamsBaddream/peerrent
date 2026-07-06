# PeerRent

A peer-to-peer rental marketplace on the Casper Network. List your gear, rent someone else's, and let a smart contract hold the security deposit — with AI-powered damage detection deciding who gets it back.

Built for the **Casper Agentic Buildathon 2026** (Agentic AI · DeFi & Payments · RWA tracks).

## How it works

1. **List** — an owner posts an item with photos, a daily rate, and a deposit amount. The listing is registered on-chain via the PeerRent contract.
2. **Rent** — a renter picks dates and pays. The deposit is locked in the smart contract on Casper Testnet for the duration of the rental.
3. **Return** — the renter uploads photos of the returned item. A vision model (Gemini 2.5 Flash) compares before/after photos and issues a damage verdict.
4. **Settle** — no damage: the contract releases the deposit back to the renter. Damage: the deposit goes to the owner. Both parties can rate each other, with ratings stored on-chain.

Sign-up uses phone OTP plus a selfie liveness check to keep accounts human.

## Live on Casper Testnet

| | |
|---|---|
| Contract package | [`d086038b1cedd634d8c6789fe0f785a037d18ec3bd4d909c50624585f8ff83f5`](https://testnet.cspr.live/contract-package/d086038b1cedd634d8c6789fe0f785a037d18ec3bd4d909c50624585f8ff83f5) |
| Deploy hash | [`7bc372094979ef63b60ce88982f8dd23e238472b794ed1dc8c8e9a06f6bfa493`](https://testnet.cspr.live/deploy/7bc372094979ef63b60ce88982f8dd23e238472b794ed1dc8c8e9a06f6bfa493) |
| Block | 8328388 |

The app's listing, rent, and return flows each produce real deploys on testnet — transaction hashes are persisted and shown in the UI.

## Architecture

```
app/                  Next.js 15 (App Router, TypeScript, Tailwind)
├── app/              Pages + API routes (listings, rent, return, rate, auth, AI)
├── components/       UI components
└── lib/              Casper contract client, x402 payments, Supabase, types

peerrent-contract/    Rust smart contract (Odra 2.8.2)
└── src/peerrent.rs   Listings, deposits, settlement, ratings

deploy-contract.js    Testnet deploy script (casper-js-sdk v5)
```

**Stack:** Casper Network · Odra (Rust) · x402 payment protocol · Next.js · Supabase (Postgres + Storage) · Gemini 2.5 Flash (vision) · Casper Wallet

### Smart contract entry points

| Entry point | Purpose |
|---|---|
| `list_item` | Register an item; owner stakes 1 CSPR |
| `rent_item` | Lock the renter's deposit in the contract |
| `return_item` | Settle: refund renter (no damage) or pay owner (damage) |
| `rate_user` / `get_rating` | On-chain reputation (1–5 stars) |
| `is_rented`, `get_item_owner`, `get_daily_rate`, `get_deposit_amount` | Read state |

## Running locally

Prereqs: Node 20+, a Supabase project, a Gemini API key.

```bash
cd app
npm install
cp .env.example .env.local   # fill in the values below
npm run dev                  # http://localhost:3000
```

`.env.local`:

```
GEMINI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
CASPER_NODE_URL=https://node.testnet.casper.network/rpc
CASPER_CONTRACT_HASH=d086038b1cedd634d8c6789fe0f785a037d18ec3bd4d909c50624585f8ff83f5
CASPER_WALLET_ADDRESS=<your testnet public key>
X402_FACILITATOR_URL=https://x402-facilitator.cspr.cloud
TWILIO_ACCOUNT_SID=            # optional — OTP falls back to dev code 000000
TWILIO_AUTH_TOKEN=             # optional
TWILIO_VERIFY_SERVICE_SID=     # optional
```

Create the database schema by running `app/supabase-schema.sql` in the Supabase SQL editor, and create a public storage bucket named `photos`.

### Building & deploying the contract

```bash
cd peerrent-contract
rustup toolchain install nightly-2025-02-17   # newer nightlies emit unsupported bulk-memory WASM ops
cargo odra build -c PeerRent
node ../deploy-contract.js                     # needs a funded testnet key in keys/secret_key.pem
```

Deploying the 292 KB WASM costs ~271 CSPR on testnet ([faucet](https://testnet.cspr.live/tools/faucet)).

## Hackathon notes

This is a hackathon prototype: API routes trust a client-supplied user id, the backend signs contract deploys custodially, and RLS policies are permissive. Production hardening (wallet-signed deploys, real authentication on every route) is the obvious next step.
