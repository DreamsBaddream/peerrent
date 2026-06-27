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

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: Buffer.from(beforeRes).toString("base64"),
        },
      },
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: Buffer.from(afterRes).toString("base64"),
        },
      },
      `Compare these two images of the same rental item. First is BEFORE rental, second is AFTER return. Look for new scratches, dents, stains, broken parts, or missing components. Reply ONLY with valid JSON: {"damageDetected": boolean, "reason": "brief explanation", "severity": "none|minor|major"}`,
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
