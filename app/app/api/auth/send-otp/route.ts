import twilio from "twilio"

export async function POST(req: Request) {
  try {
    const { phone } = await req.json()

    if (!phone) {
      return Response.json({ error: "Phone number is required" }, { status: 400 })
    }

    // Dev mode: skip real SMS if Twilio is not configured
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.log(`[DEV] OTP for ${phone}: 000000`)
      return Response.json({ success: true, devMode: true })
    }

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    )

    await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
      .verifications.create({ to: phone, channel: "sms" })

    return Response.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to send OTP"
    return Response.json({ error: message }, { status: 500 })
  }
}
