import { supabase } from "@/lib/supabase"
import { returnItemOnChain } from "@/lib/casper-contract"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    const rentalId = formData.get("rentalId") as string
    const afterPhotos = formData.getAll("afterPhotos") as File[]

    if (!rentalId) {
      return Response.json({ error: "rentalId is required" }, { status: 400 })
    }

    const { data: rental, error: rentalError } = await supabase
      .from("rentals")
      .select("*, listing:listings!rentals_listing_id_fkey(owner_id)")
      .eq("id", rentalId)
      .single()

    if (rentalError || !rental) {
      return Response.json({ error: "Rental not found" }, { status: 404 })
    }

    if (rental.status !== "active") {
      return Response.json(
        { error: "Rental is not in active status" },
        { status: 409 }
      )
    }

    const afterPhotoUrls: string[] = []

    for (const photo of afterPhotos) {
      const arrayBuffer = await photo.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const ext = photo.name.split(".").pop() || "jpg"
      const fileName = `returns/${rentalId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from("peerrent-photos")
        .upload(fileName, buffer, {
          contentType: photo.type || "image/jpeg",
          upsert: false,
        })

      if (uploadError) {
        return Response.json(
          { error: `Photo upload failed: ${uploadError.message}` },
          { status: 500 }
        )
      }

      const { data: publicUrlData } = supabase.storage
        .from("peerrent-photos")
        .getPublicUrl(fileName)

      afterPhotoUrls.push(publicUrlData.publicUrl)
    }

    let damageDetected = false
    let damageReason = "No photos provided for comparison"
    let damageSeverity = "none"

    const beforePhotos: string[] = rental.before_photos || []

    if (beforePhotos.length > 0 && afterPhotoUrls.length > 0) {
      const beforeUrl = beforePhotos[0]
      const afterUrl = afterPhotoUrls[0]

      const damageCheckResponse = await fetch(
        new URL("/api/ai/damage-check", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").toString(),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ beforeUrl, afterUrl }),
        }
      )

      if (damageCheckResponse.ok) {
        const damageResult = await damageCheckResponse.json()
        damageDetected = damageResult.damageDetected ?? false
        damageReason = damageResult.reason ?? "Analysis complete"
        damageSeverity = damageResult.severity ?? "none"
      } else {
        damageReason = "Damage check service unavailable"
      }
    }

    const newStatus = damageDetected ? "disputed" : "returned"

    const { error: updateError } = await supabase
      .from("rentals")
      .update({
        after_photos: afterPhotoUrls,
        status: newStatus,
        damage_detected: damageDetected,
      })
      .eq("id", rentalId)

    if (updateError) {
      return Response.json({ error: updateError.message }, { status: 500 })
    }

    if (!damageDetected) {
      await supabase
        .from("listings")
        .update({ is_available: true })
        .eq("id", rental.listing_id)
    }

    const casperHash = await returnItemOnChain(rental.listing_id, damageDetected)
    if (casperHash) {
      await supabase.from("rentals").update({ tx_hash: casperHash }).eq("id", rentalId)
    }

    return Response.json({
      damageDetected,
      reason: damageReason,
      severity: damageSeverity,
      rentalId,
      releaseDeposit: !damageDetected,
      casperTxHash: casperHash,
    })
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to process return"
    return Response.json({ error: message }, { status: 500 })
  }
}
