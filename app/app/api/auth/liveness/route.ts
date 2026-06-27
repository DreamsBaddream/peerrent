import { GoogleGenerativeAI } from "@google/generative-ai"
import { supabase } from "@/lib/supabase"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const selfieFile = formData.get("selfie") as File | null
    const userId = formData.get("user_id") as string | null

    if (!selfieFile) {
      return Response.json({ error: "Selfie image is required" }, { status: 400 })
    }

    const arrayBuffer = await selfieFile.arrayBuffer()
    const base64Data = Buffer.from(arrayBuffer).toString("base64")

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
    const parsed: { isLive: boolean; reason: string } = jsonMatch
      ? JSON.parse(jsonMatch[0])
      : { isLive: false, reason: "Could not analyze" }

    if (parsed.isLive && userId) {
      const buffer = Buffer.from(base64Data, "base64")
      const fileName = `selfies/${userId}_${Date.now()}.jpg`

      const { error: uploadError } = await supabase.storage
        .from("peerrent-photos")
        .upload(fileName, buffer, { contentType: "image/jpeg", upsert: true })

      if (uploadError) {
        console.error("Selfie upload error:", uploadError.message)
      } else {
        const { data: publicUrlData } = supabase.storage
          .from("peerrent-photos")
          .getPublicUrl(fileName)

        await supabase
          .from("users")
          .update({ verified: true, selfie_url: publicUrlData.publicUrl })
          .eq("id", userId)
      }
    }

    return Response.json({ isLive: parsed.isLive, reason: parsed.reason })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Liveness check failed"
    return Response.json({ error: message }, { status: 500 })
  }
}
