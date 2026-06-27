# PeerRent — Root Router (L0)

PeerRent is a peer-to-peer rental marketplace built on Casper Network for the Casper Agentic Buildathon 2026.

## Routing Table

| Job | Workspace | Entry Stage |
|-----|-----------|-------------|
| build-contract | smart-contract/ | 01-scaffold |
| build-backend | backend/ | 01-supabase-schema |
| build-frontend | frontend/ | 01-shell |
| build-ai | ai-agent/ | 01-damage-check |

## What NOT to Load

| Resource | Why |
|----------|-----|
| node_modules/ | Build artifacts |
| .next/ | Build artifacts |
| target/ | Rust build artifacts |
| Other workspace folders | Load only the workspace relevant to the current job |

## Shared References

All workspaces may reference `shared/references/` for:
- `tech-stack.md` — stack decisions (do not deviate)
- `casper-api.md` — Casper, Odra, x402 API patterns
- `conventions.md` — code style and naming rules

## Project Context

- **What:** Peer rental marketplace — list items, rent with smart contract deposit, AI damage detection on return
- **Blockchain:** Casper Network (Odra framework for smart contracts, x402 for micropayments)
- **Auth:** Phone OTP + selfie liveness check (Claude API)
- **AI:** Claude API (claude-sonnet-4-6) for damage detection and liveness
- **DB:** Supabase (Postgres + Storage)
- **Deadline:** July 1, 2026
