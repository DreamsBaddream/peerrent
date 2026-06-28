import { NextRequest } from "next/server"
import { supabase } from "@/lib/supabase"
import { rentItemOnChain } from "@/lib/casper-contract"

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

export async function POST(req: NextRequest) {
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
      .select("id, is_available, owner_id, photos, deposit_amount")
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

    // Lock deposit on-chain and persist the deploy hash
    const depositMotes = Math.round((listing.deposit_amount ?? 0) * 1_000_000_000).toString()
    const deployHash = await rentItemOnChain(listingId, rentalDays, depositMotes)
    if (deployHash) {
      await supabase.from("rentals").update({ tx_hash: deployHash }).eq("id", rental.id)
    }

    return Response.json({ rentalId: rental.id, rentalDays, txHash: deployHash })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create rental"
    return Response.json({ error: message }, { status: 500 })
  }
}

