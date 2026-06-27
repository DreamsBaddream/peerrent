# Smart Contract — Context

## Purpose
Casper smart contract handling: item listing (with owner stake), rental escrow, return + deposit release/hold, and on-chain ratings.

## Contract Functions

| Function | Caller | Description |
|----------|--------|-------------|
| `list_item(item_id, deposit_amount, daily_rate)` | Owner | Stake CSPR to list |
| `rent_item(item_id, rental_days)` | Renter | Lock deposit in escrow |
| `return_item(item_id, damage: bool)` | Renter | Release or hold deposit |
| `rate_user(user_wallet, score)` | Either party | Write rating on-chain |
| `get_rating(user_wallet)` | Anyone | Read average rating |

## Storage

- `items: Mapping<String, Item>` — item_id → Item struct
- `rentals: Mapping<String, Rental>` — item_id → Rental struct
- `ratings: Mapping<Address, Vec<u8>>` — wallet → list of scores

## Current Stage
→ Start at `stages/01-scaffold/`
