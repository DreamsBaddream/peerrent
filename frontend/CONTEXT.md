# Frontend — Context

## Pages

| Route | Page | Auth Required |
|-------|------|---------------|
| / | Browse listings (grid) | No |
| /signup | Phone OTP + selfie | No |
| /list | Create listing | Yes |
| /item/[id] | Item detail + rent button | No |
| /dashboard | My listings + active rentals | Yes |
| /return/[id] | Upload after-photos | Yes |

## Components to Build

- `ItemCard` — listing thumbnail (photo, title, price/day, deposit)
- `ListingGrid` — grid of ItemCards
- `WalletButton` — connect/disconnect Casper Wallet
- `OTPInput` — 6-digit OTP input
- `SelfieCapture` — camera component for liveness selfie
- `PhotoUpload` — multi-photo upload with preview
- `RentModal` — date picker + deposit summary + confirm button
- `ReturnFlow` — before/after photo comparison + submit

## Current Stage
→ Start at `stages/01-shell/`
