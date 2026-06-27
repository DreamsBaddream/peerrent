# Casper / Odra / x402 API Reference

## Odra Framework (Smart Contracts)

### Prerequisites
```bash
rustup target add wasm32-unknown-unknown
cargo install cargo-odra --locked
```

### New Project
```bash
cargo odra new --name peerrent-contract && cd peerrent_contract
```

### Minimal Contract Pattern
```rust
use odra::prelude::*;

#[odra::module]
pub struct MyContract {
    value: Var<u64>,
    owner: Var<Address>,
}

#[odra::module]
impl MyContract {
    pub fn init(&mut self) {
        self.owner.set(self.env().caller());
    }

    pub fn set_value(&mut self, v: u64) {
        self.value.set(v);
    }

    pub fn get_value(&self) -> u64 {
        self.value.get_or_default()
    }
}
```

### Handling CSPR (native token)
```rust
// Require payment when calling a function
pub fn deposit(&mut self) {
    let amount = self.env().attached_value();
    // store it, check it, etc.
}

// Transfer CSPR from contract to address
pub fn withdraw(&mut self, to: Address, amount: U512) {
    self.env().transfer_tokens(&to, &amount);
}
```

### Mappings (like Solidity mapping)
```rust
use odra::prelude::*;

#[odra::module]
pub struct Registry {
    records: Mapping<Address, u64>,
}
```

### Testing
```bash
cargo odra test          # fast OdraVM
cargo odra test -b casper  # real CasperVM
```

### Deploy to Testnet
- Use `odra_casper_livenet_env`
- Set `CASPER_NODE_URL` and wallet keypair
- See: https://odra.dev/docs/casper/livenet

---

## x402 Protocol (Micropayments)

x402 lets an API charge per request using HTTP 402 + on-chain payment.

### Flow
1. Client requests resource
2. Server returns `402` + price in `PAYMENT-REQUIRED` header
3. Client signs payment, retries with `PAYMENT-SIGNATURE` header
4. Server verifies via Casper x402 Facilitator
5. Server returns `200` + data

### Server-side (Next.js API route)
```typescript
import { paymentMiddleware } from "@x402/express" // or Next.js adapter

// protect an endpoint
app.use(paymentMiddleware({
  "POST /api/rent": {
    accepts: [{
      scheme: "exact",
      price: "$0.01",
      network: "casper-testnet", // Casper-specific
      payTo: process.env.CASPER_WALLET_ADDRESS
    }],
    description: "Process rental payment"
  }
}, resourceServer))
```

### Client-side
```typescript
import { wrapFetchWithPayment } from "@x402/fetch"

const paidFetch = wrapFetchWithPayment(fetch, client)
const res = await paidFetch("/api/rent", {
  method: "POST",
  body: JSON.stringify({ itemId, days })
})
```

### Casper x402 Facilitator
- Testnet: provided free by Casper for hackathon participants
- Settles on Casper chain (not Base/EVM)
- Docs: https://developer.casper.network (check AI Toolkit section)

---

## casper-js-sdk (Wallet Connection)

```typescript
import { CasperClient, CasperServiceByJsonRPC } from "casper-js-sdk"

// Connect Casper Wallet (browser)
const provider = window.casperWallet
await provider.requestConnection()
const publicKey = await provider.getActivePublicKey()
```

---

## Supabase (Off-chain DB)

```typescript
import { createClient } from "@supabase/supabase-js"

// server-side (API routes)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// client-side
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```
