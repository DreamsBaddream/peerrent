import { supabase } from "@/lib/supabase"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const renterId = url.searchParams.get("renter_id")

    if (!renterId) {
      return Response.json({ error: "renter_id is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("rentals")
      .select("*")
      .eq("renter_id", renterId)
      .order("created_at", { ascending: false })

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json(data)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch rentals"
    return Response.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { listingId, startDate, endDate, renterWallet, renterId, txHash } =
      await req.json()

    if (!listingId || !startDate || !endDate || !renterId) {
      return Response.json(
        { error: "listingId, startDate, endDate, and renterId are required" },
        { status: 400 }
      )
    }

    // Validate listing exists and is available
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("id, is_available, owner_id, photos")
      .eq("id", listingId)
      .single()

    if (listingError || !listing) {
      return Response.json({ error: "Listing not found" }, { status: 404 })
    }

    if (!listing.is_available) {
      return Response.json(
        { error: "Listing is not available for rent" },
        { status: 409 }
      )
    }

    if (listing.owner_id === renterId) {
      return Response.json(
        { error: "You cannot rent your own listing" },
        { status: 400 }
      )
    }

    // Calculate rental days
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffMs = end.getTime() - start.getTime()
    const rentalDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    if (rentalDays <= 0) {
      return Response.json(
        { error: "End date must be after start date" },
        { status: 400 }
      )
    }

    // Update wallet address if provided
    if (renterWallet) {
      await supabase
        .from("users")
        .update({ wallet_address: renterWallet })
        .eq("id", renterId)
    }

    // Create rental record
    const rentalInsert: Record<string, unknown> = {
      listing_id: listingId,
      renter_id: renterId,
      start_date: startDate,
      end_date: endDate,
      before_photos: listing.photos || [],
      after_photos: [],
      status: "active",
      damage_detected: null,
    }

    if (txHash) {
      rentalInsert.tx_hash = txHash
    }

    const { data: rental, error: rentalError } = await supabase
      .from("rentals")
      .insert(rentalInsert)
      .select("id")
      .single()

    if (rentalError) {
      return Response.json({ error: rentalError.message }, { status: 500 })
    }

    // Mark listing as unavailable
    const { error: updateError } = await supabase
      .from("listings")
      .update({ is_available: false })
      .eq("id", listingId)

    if (updateError) {
      console.error("Failed to mark listing unavailable:", updateError.message)
    }

    return Response.json({ rentalId: rental.id, rentalDays })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create rental"
    return Response.json({ error: message }, { status: 500 })
  }
}
