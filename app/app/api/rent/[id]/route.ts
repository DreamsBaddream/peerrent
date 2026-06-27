import { supabase } from "@/lib/supabase"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data, error } = await supabase
      .from("rentals")
      .select("*, listing:listings!rentals_listing_id_fkey(owner_id, title, photos)")
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return Response.json({ error: "Rental not found" }, { status: 404 })
      }
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json(data)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch rental"
    return Response.json({ error: message }, { status: 500 })
  }
}
