# Stage 01: App Shell

## Input

| Source | What | Why |
|--------|------|-----|
| shared/references/tech-stack.md | Next.js 14, Tailwind, TypeScript | Setup commands |

## Process

### Step 1: Init Next.js project
```bash
cd frontend
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

### Step 2: Install dependencies
```bash
npm install @supabase/supabase-js casper-js-sdk @anthropic-ai/sdk react-hot-toast
```

### Step 3: Create .env.local
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
ANTHROPIC_API_KEY=
CASPER_NODE_URL=https://rpc.testnet.casperlabs.io
CASPER_CONTRACT_HASH=
```

### Step 4: Create app/layout.tsx
- Add Toaster from react-hot-toast
- Navbar with: Logo | Browse | List Item | Dashboard | WalletButton

### Step 5: Create lib/supabase.ts
```typescript
import { createClient } from "@supabase/supabase-js"
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### Step 6: Verify
```bash
npm run dev
```
App opens on localhost:3000 with navbar visible.

## Output

Running Next.js app with Tailwind, navbar, Supabase client, react-hot-toast.

## Completion

Proceed to `stages/02-browse/`
