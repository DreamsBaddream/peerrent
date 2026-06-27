# Stage 02: Selfie Liveness Check

## Input

| Source | What | Why |
|--------|------|-----|
| Caller (backend /api/auth/liveness) | imageBase64 | Selfie to check |

## Process

### Step 1: Create /api/ai/liveness/route.ts

```typescript
import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic()

export async function POST(req: Request) {
  const { imageBase64 } = await req.json()

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 128,
    messages: [{
      role: "user",
      content: [
        {
          type: "text",
          text: "Is this a real live person taking a selfie? Check for signs of life (real face, not a photo of a photo, not AI generated). Reply only with JSON: { isLive: boolean, reason: string }"
        },
        {
          type: "image",
          source: {
            type: "base64",
            media_type: "image/jpeg",
            data: imageBase64
          }
        }
      ]
    }]
  })

  const text = response.content[0].type === "text" ? response.content[0].text : ""
  const result = JSON.parse(text)
  return Response.json(result)
}
```

### Step 2: Test with:
- Real selfie → isLive: true
- Photo of photo → isLive: false
- Cartoon/AI face → isLive: false

## Output

`/api/ai/liveness` route returning `{ isLive: boolean, reason: string }`

## Completion

AI agent workspace complete. Proceed to `frontend/` workspace.
