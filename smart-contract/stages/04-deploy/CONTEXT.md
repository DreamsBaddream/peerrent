# Stage 04: Deploy to Casper Testnet

## Input

| Source | What | Why |
|--------|------|-----|
| shared/references/casper-api.md | Deploy steps + env vars | How to deploy |
| .env | CASPER_NODE_URL, wallet keypair | Credentials |

## Process

### Step 1: Build WASM
```bash
cargo odra build
```

### Step 2: Set env vars
```
CASPER_NODE_URL=https://rpc.testnet.casperlabs.io
CASPER_SECRET_KEY=<path-to-secret_key.pem>
```

### Step 3: Deploy
Use `odra_casper_livenet_env` or Casper CLI:
```bash
casper-client put-deploy \
  --node-address $CASPER_NODE_URL \
  --secret-key $CASPER_SECRET_KEY \
  --session-path target/wasm32-unknown-unknown/release/peerrent_contract.wasm \
  --payment-amount 200000000000
```

### Step 4: Record contract hash
After deploy succeeds, copy the contract hash to:
- `backend/stages/01-supabase-schema/contract-hash.txt`
- `.env` as `CASPER_CONTRACT_HASH`

## Output

Contract deployed on Casper testnet. Contract hash recorded.

## Completion

Smart contract workspace complete. Proceed to `backend/` workspace.
