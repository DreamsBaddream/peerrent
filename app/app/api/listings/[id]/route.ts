import { supabase } from "@/lib/supabase"

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
