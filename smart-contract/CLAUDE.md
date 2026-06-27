# Smart Contract Workspace (L1)

Rust + Odra Framework smart contract for PeerRent on Casper Network.

## What to Load

| Resource | When | Why |
|----------|------|-----|
| `stages/{current}/CONTEXT.md` | Always | Current stage contract |
| `shared/references/casper-api.md` | Always | Odra patterns and deploy steps |
| `shared/references/conventions.md` | Always | Naming rules |

## What NOT to Load

| Resource | Why |
|----------|-----|
| frontend/ | Irrelevant to contract |
| backend/ | Irrelevant to contract |
| ai-agent/ | Irrelevant to contract |
| node_modules/ | Build artifacts |

## Stage Progression

1. `01-scaffold` — Init Odra project, Cargo.toml setup
2. `02-write-contract` — Write PeerRent contract with all functions
3. `03-test` — Unit tests for all contract functions
4. `04-deploy` — Deploy to Casper testnet, record contract hash
