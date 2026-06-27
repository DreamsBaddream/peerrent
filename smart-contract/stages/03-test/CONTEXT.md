# Stage 03: Unit Tests

## Input

| Source | What | Why |
|--------|------|-----|
| src/peerrent.rs | Contract implementation | What to test |

## Process

### Step 1: Write test module in src/peerrent.rs

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use odra::host::{Deployer, NoArgs};

    #[test]
    fn test_list_item() { ... }

    #[test]
    fn test_rent_and_return_no_damage() { ... }

    #[test]
    fn test_return_with_damage() { ... }

    #[test]
    fn test_rating() { ... }
}
```

### Step 2: Run tests
```bash
cargo odra test
cargo odra test -b casper  # against real CasperVM
```

### Step 3: Fix any failures before moving on

## Output

All tests passing on both OdraVM and CasperVM.

## Completion

Proceed to `stages/04-deploy/`
