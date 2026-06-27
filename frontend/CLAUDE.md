# Frontend Workspace (L1)

Next.js 14 UI for PeerRent.

## What to Load

| Resource | When | Why |
|----------|------|-----|
| `stages/{current}/CONTEXT.md` | Always | Current stage contract |
| `shared/references/tech-stack.md` | Always | Stack decisions |
| `shared/references/conventions.md` | Always | Naming + code style |

## What NOT to Load

| Resource | Why |
|----------|-----|
| smart-contract/ | No direct contract calls from frontend — goes through backend API |
| ai-agent/ | Called via backend, not directly |

## Stage Progression

1. `01-shell` — Next.js init, Tailwind, layout, .env
2. `02-browse` — Homepage listing grid + item detail page
3. `03-list-item` — Create listing form + photo upload
4. `04-rent-flow` — Wallet connect + rent button + deposit tx
5. `05-return-flow` — After-photo upload + return confirmation
