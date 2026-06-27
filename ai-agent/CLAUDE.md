# AI Agent Workspace (L1)

Claude API-powered damage detection and selfie liveness for PeerRent.

## What to Load

| Resource | When | Why |
|----------|------|-----|
| `stages/{current}/CONTEXT.md` | Always | Current stage contract |
| `shared/references/tech-stack.md` | Always | Model to use (claude-sonnet-4-6) |

## What NOT to Load

| Resource | Why |
|----------|-----|
| smart-contract/ | Irrelevant |
| frontend/ | Irrelevant |
| backend/ | AI endpoints are standalone, called by backend |

## Stage Progression

1. `01-damage-check` — Before/after photo comparison endpoint
2. `02-liveness-check` — Selfie liveness detection endpoint
