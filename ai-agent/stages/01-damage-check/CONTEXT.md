# Stage 01: Damage Detection

## Input

| Source | What | Why |
|--------|------|-----|
| Caller (backend /api/return) | before_photo_url, after_photo_url | Images to compare |

## Process

### Step 1: Create /api/ai/damage-check/route.ts

```typescript
import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic()

export async function POST(req: Request) {
  const { beforeUrl, afterUrl } = await req.json()

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 256,
    messages: [{
      role: "user",
      content: [
        {
          type: "text",
          text: "Compare these two images of the same rental item. The first is BEFORE rental, the second is AFTER return. Is there any new damage, stains, or missing parts? Reply only with JSON: { damaged: boolean, reason: string }"
        },
        { type: "image", source: { type: "url", url: beforeUrl } },
        { type: "image", source: { type: "url", url: afterUrl } }
      ]
    }]
  })

  const text = response.content[0].type === "text" ? response.content[0].text : ""
  const result = JSON.parse(text)
  return Response.json(result)
}
```

### Step 2: Test with sample before/after images
- No damage case: same item, same condition
- Damage case: broken part, stain visible

## Output

`/api/ai/damage-check` route returning `{ damaged: boolean, reason: string }`

## Completion

Proceed to `stages/02-liveness-check/`
