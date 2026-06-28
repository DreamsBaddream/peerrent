import twilio from "twilio"
import { supabase } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json()

    if (!phone || !otp) {
      return Response.json(
        { error: "Phone and code are required" },
        { status: 400 }
      )
    }

    // Dev mode: accept "000000" as the OTP when Twilio is not configured
    const devMode = !process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN
    if (!devMode) {
      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      )
      const verificationCheck = await client.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
        .verificationChecks.create({ to: phone, code: otp })

      if (verificationCheck.status !== "approved") {
        return Response.json({ error: "Invalid or expired OTP" }, { status: 400 })
      }
    } else if (otp !== "000000") {
      return Response.json({ error: "Dev mode: use code 000000" }, { status: 400 })
    }

    // Upsert user in Supabase
    const { data, error } = await supabase
      .from("users")
      .upsert(
        { phone, verified: false },
        { onConflict: "phone", ignoreDuplicates: false }
      )
      .select("id")
      .single()

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ userId: data.id, success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to verify OTP"
    return Response.json({ error: message }, { status: 500 })
  }
}
