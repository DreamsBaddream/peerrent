# Stage 04: Rent Flow + Wallet Connect

## Input

| Source | What | Why |
|--------|------|-----|
| frontend/CONTEXT.md | WalletButton, RentModal components | What to build |
| backend/CONTEXT.md | POST /api/rent | API shape |
| shared/references/casper-api.md | casper-js-sdk wallet connection | How to connect wallet |

## Process

### Step 1: Build WalletButton component
File: `components/WalletButton.tsx`
- "use client"
- On click: call `window.casperWallet.requestConnection()`
- Show connected public key (truncated) when connected
- Store in React state / context

### Step 2: Build RentModal component
File: `components/RentModal.tsx`
- Date range picker (start date, end date)
- Summary: X days × $Y/day + deposit = $Z total
- "Confirm & Pay Deposit" button

### Step 3: On confirm
- POST to /api/rent with `{ listingId, startDate, endDate }`
- Backend triggers escrow tx on Casper
- On success: show toast "Rental confirmed! Tx: [hash]"
- Redirect to /dashboard

### Step 4: Wire RentModal into item detail page
Replace stub "Rent" button with working RentModal.

## Output

Wallet connect works. Rent flow completes. Deposit tx recorded.

## Completion

Proceed to `stages/05-return-flow/`
