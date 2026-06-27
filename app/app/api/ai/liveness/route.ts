import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: Request) {
  try {
    const { imageBase64 } = await req.json()

    if (!imageBase64) {
      return Response.json({ error: "imageBase64 required" }, { status: 400 })
    }

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "")

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data,
        },
      },
      `Is this a real live person taking a selfie? Check: real human face (not drawing/avatar/AI-generated), live photo (not photo of a photo or screen), face visible. Reply ONLY with valid JSON: {"isLive": boolean, "reason": "brief explanation"}`,
    ])

    const text = result.response.text()
    const jsonMatch = text.match(/\{[\s\S]*?\}/)
    const parsed = jsonMatch
      ? JSON.parse(jsonMatch[0])
      : { isLive: false, reason: "Could not analyze" }

    return Response.json(parsed)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Liveness check failed"
    return Response.json({ error: message }, { status: 500 })
  }
}
