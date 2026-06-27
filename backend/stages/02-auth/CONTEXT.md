# Stage 02: Auth — Phone OTP + Selfie Liveness

## Input

| Source | What | Why |
|--------|------|-----|
| shared/references/tech-stack.md | Twilio + Claude API | Auth tools |
| backend/CONTEXT.md | /api/auth/* routes | What to build |

## Process

### Step 1: Install dependencies
```bash
npm install twilio @anthropic-ai/sdk
```

### Step 2: Create /api/auth/send-otp/route.ts
- Accept `{ phone: string }`
- Use Twilio Verify to send OTP SMS
- Return `{ success: true }`

### Step 3: Create /api/auth/verify-otp/route.ts
- Accept `{ phone: string, code: string }`
- Verify with Twilio Verify
- If valid: upsert user in Supabase, return `{ userId, token }`

### Step 4: Create /api/auth/liveness/route.ts
- Accept `{ imageBase64: string }` (selfie from frontend)
- Send to Claude API with prompt:
  `"Does this image show a real live person looking at the camera? Reply with JSON: { isLive: boolean, reason: string }"`
- Return Claude's response
- If isLive: update user.verified = true in Supabase

### Step 5: Store session
Use a simple JWT or Supabase session token. Store in httpOnly cookie.

## Output

3 working API routes. User can sign up, verify phone, pass liveness check.

## Completion

Proceed to `stages/03-listings-api/`
