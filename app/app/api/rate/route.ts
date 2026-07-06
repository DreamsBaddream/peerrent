import { supabase } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const { rentalId, targetWallet, score, raterId } = await req.json()

    if (!rentalId || score === undefined || !raterId) {
      return Response.json(
        { error: "rentalId, score, and raterId are required" },
        { status: 400 }
      )
    }

    if (typeof score !== "number" || score < 1 || score > 5) {
      return Response.json(
        { error: "score must be a number between 1 and 5" },
        { status: 400 }
      )
    }

    const { data: rental, error: rentalError } = await supabase
      .from("rentals")
      .select("id, listing_id, renter_id, status, listing:listings!rentals_listing_id_fkey(owner_id)")
      .eq("id", rentalId)
      .single()

    if (rentalError || !rental) {
      return Response.json({ error: "Rental not found" }, { status: 404 })
    }

    const listing = (Array.isArray(rental.listing) ? rental.listing[0] : rental.listing) as { owner_id: string } | null
    const ownerId = listing?.owner_id
    const isOwner = ownerId === raterId
    const isRenter = rental.renter_id === raterId

    if (!isOwner && !isRenter) {
      return Response.json(
        { error: "You are not authorized to rate this rental" },
        { status: 403 }
      )
    }

    if (rental.status === "active") {
      return Response.json(
        { error: "Cannot rate an active rental — return the item first" },
        { status: 409 }
      )
    }

    let resolvedTargetWallet: string | null = targetWallet ?? null
    if (!resolvedTargetWallet) {
      const targetUserId = isRenter ? ownerId : rental.renter_id
      if (targetUserId) {
        const { data: targetUser } = await supabase
          .from("users")
          .select("wallet_address")
          .eq("id", targetUserId)
          .single()
        resolvedTargetWallet = targetUser?.wallet_address ?? null
      }
    }

    const { error: ratingError } = await supabase.from("ratings").insert({
      rental_id: rentalId,
      rater_id: raterId,
      target_wallet: resolvedTargetWallet,
      score,
    })

    if (ratingError) {
      console.error("Rating insert error:", ratingError.message)
    }

    return Response.json({ success: true })
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to submit rating"
    return Response.json({ error: message }, { status: 500 })
  }
}
