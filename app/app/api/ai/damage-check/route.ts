import { createHash } from "crypto"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: Request) {
  try {
    const { beforeUrl, afterUrl } = await req.json()

    if (!beforeUrl || !afterUrl) {
      return Response.json({ error: "beforeUrl and afterUrl are required" }, { status: 400 })
    }

    const [beforeRes, afterRes] = await Promise.all([
      fetch(beforeUrl).then((r) => r.arrayBuffer()),
      fetch(afterUrl).then((r) => r.arrayBuffer()),
    ])

    const beforeBuf = Buffer.from(beforeRes)
    const afterBuf = Buffer.from(afterRes)

    const beforeHash = createHash("sha256").update(beforeBuf).digest("hex")
    const afterHash = createHash("sha256").update(afterBuf).digest("hex")

    if (beforeHash === afterHash) {
      return Response.json({
        damageDetected: false,
        reason: "Return photo is identical to the pickup photo",
        severity: "none",
      })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: beforeBuf.toString("base64"),
        },
      },
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: afterBuf.toString("base64"),
        },
      },
      `You are inspecting a rental item for NEW damage. Image 1 is the item BEFORE the rental. Image 2 is the item AFTER return. Only report damage that is visible in image 2 but NOT present in image 1. Pre-existing wear, marks, or features that appear in both images are NOT damage. Differences in lighting, angle, framing, or image quality are NOT damage. If the two images show the item in the same condition, or you are uncertain, report no damage. Reply ONLY with valid JSON: {"damageDetected": boolean, "reason": "brief explanation", "severity": "none|minor|major"}`,
    ])

    const text = result.response.text()
    const jsonMatch = text.match(/\{[\s\S]*?\}/)
    const parsed = jsonMatch
      ? JSON.parse(jsonMatch[0])
      : { damageDetected: false, reason: "Could not analyze", severity: "none" }

    return Response.json(parsed)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Damage check failed"
    return Response.json({ error: message }, { status: 500 })
  }
}
