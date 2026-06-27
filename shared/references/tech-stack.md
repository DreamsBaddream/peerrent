# Tech Stack — Immutable Reference

Do not deviate from these choices without explicit user approval.

| Layer | Choice | Notes |
|-------|--------|-------|
| Frontend + API | Next.js 14 (App Router) | Full-stack, `/app` directory |
| Styling | Tailwind CSS | No CSS modules, no styled-components |
| Blockchain | Casper Network | Testnet during dev, mainnet for submission |
| Smart Contract | Rust + Odra Framework | Casper's official toolkit |
| Payments | x402 Protocol | Free sponsored txs from Casper hackathon |
| Phone OTP | Twilio Verify | SMS OTP, one phone per account |
| Liveness Check | Claude API (vision) | Blink/head-turn detection |
| Damage Detection | Claude API (vision) | Before/after photo comparison |
| AI Model | claude-sonnet-4-6 | Current production model |
| Database | Supabase (Postgres) | Off-chain user/listing/rental data |
| File Storage | Supabase Storage | Item photos, before/after photos |
| Wallet | Casper Wallet (browser extension) | casper-js-sdk for connection |
| Language | TypeScript | Strict mode on |
| Package Manager | npm | Not yarn or pnpm |
