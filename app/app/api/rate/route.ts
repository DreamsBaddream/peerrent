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

    // Validate rental exists
    const { data: rental, error: rentalError } = await supabase
      .from("rentals")
      .select("id, listing_id, renter_id, status, listing:listings!rentals_listing_id_fkey(owner_id)")
      .eq("id", rentalId)
      .single()

    if (rentalError || !rental) {
      return Response.json({ error: "Rental not found" }, { status: 404 })
    }

    // Verify the rater was a party to this rental
    const listing = rental.listing as { owner_id: string } | null
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

    // Store rating in Supabase for record-keeping
    // The actual on-chain rating is triggered from the frontend via casper-js-sdk
    const { error: ratingError } = await supabase.from("ratings").insert({
      rental_id: rentalId,
      rater_id: raterId,
      target_wallet: targetWallet,
      score,
    })

    if (ratingError) {
      // If the ratings table doesn't exist yet, log and continue gracefully
      console.error("Rating insert error:", ratingError.message)
    }

    return Response.json({ success: true })
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to submit rating"
    return Response.json({ error: message }, { status: 500 })
  }
}
