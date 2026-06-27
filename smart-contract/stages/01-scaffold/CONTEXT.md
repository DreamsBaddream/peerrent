# Stage 01: Scaffold Odra Project

## Input

| Source | What | Why |
|--------|------|-----|
| shared/references/casper-api.md | Odra install + new project commands | Setup steps |

## Process

### Step 1: Install prerequisites
```bash
rustup target add wasm32-unknown-unknown
cargo install cargo-odra --locked
```

### Step 2: Init project inside smart-contract/
```bash
cd smart-contract
cargo odra new --name peerrent-contract
cd peerrent-contract
```

### Step 3: Update Cargo.toml
Add `odra` dependency with correct version. Ensure `[lib]` crate-type includes `"cdylib"`.

### Step 4: Verify scaffold works
```bash
cargo odra test
```

## Output

Working Odra project at `smart-contract/peerrent-contract/` with passing default tests.

## Completion

Proceed to `stages/02-write-contract/`
