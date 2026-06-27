# Stage 02: Write PeerRent Contract

## Input

| Source | What | Why |
|--------|------|-----|
| smart-contract/CONTEXT.md | Function list + storage schema | What to implement |
| shared/references/casper-api.md | Odra patterns (Var, Mapping, Address, U512) | How to write it |

## Process

### Step 1: Define data structs
```rust
// Item: listed by owner
struct Item {
    owner: Address,
    deposit_amount: U512,
    daily_rate: U512,
    is_rented: bool,
}

// Rental: active rental record
struct Rental {
    renter: Address,
    start_time: u64,
    rental_days: u64,
    deposit_held: U512,
}
```

### Step 2: Write contract module
File: `src/peerrent.rs`

Functions to implement:
- `init()` — set contract owner
- `list_item(item_id: String, deposit_amount: U512, daily_rate: U512)` — store item, require small owner stake
- `rent_item(item_id: String, rental_days: u64)` — lock deposit (attached_value must equal deposit_amount)
- `return_item(item_id: String, damage: bool)` — if no damage: refund deposit to renter; if damage: transfer to owner
- `rate_user(user: Address, score: u8)` — append score (1-5) to user's rating list
- `get_rating(user: Address) -> u8` — return average score

### Step 3: Wire up in lib.rs
```rust
mod peerrent;
pub use peerrent::*;
```

## Output

`src/peerrent.rs` with all functions implemented and compiling with `cargo build`.

## Completion

Proceed to `stages/03-test/`
