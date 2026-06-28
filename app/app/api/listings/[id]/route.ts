import { supabase } from "@/lib/supabase"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { owner_id, title, description, price_per_day, deposit_amount, is_available } = body

    if (!owner_id) {
      return Response.json({ error: "owner_id is required" }, { status: 400 })
    }

    // Verify ownership
    const { data: listing, error: fetchError } = await supabase
      .from("listings")
      .select("owner_id, status")
      .eq("id", id)
      .single()

    if (fetchError || !listing) {
      return Response.json({ error: "Listing not found" }, { status: 404 })
    }

    if (listing.owner_id !== owner_id) {
      return Response.json({ error: "Not authorized" }, { status: 403 })
    }

    const updates: Record<string, unknown> = {}
    if (title !== undefined) updates.title = title
    if (description !== undefined) updates.description = description
    if (price_per_day !== undefined) updates.price_per_day = price_per_day
    if (deposit_amount !== undefined) updates.deposit_amount = deposit_amount
    if (is_available !== undefined) updates.is_available = is_available

    const { error } = await supabase.from("listings").update(updates).eq("id", id)

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update listing"
    return Response.json({ error: message }, { status: 500 })
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return Response.json({ error: "Listing ID is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("listings")
      .select(
        `
        *,
        owner:users!listings_owner_id_fkey (
          id,
          phone,
          wallet_address,
          verified
        )
      `
      )
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return Response.json({ error: "Listing not found" }, { status: 404 })
      }
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json(data)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch listing"
    return Response.json({ error: message }, { status: 500 })
  }
}
