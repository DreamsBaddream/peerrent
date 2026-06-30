import { supabase } from "@/lib/supabase"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const [userResult, listingsResult, rentalsResult] = await Promise.all([
      supabase
        .from("users")
        .select("id, phone, selfie_url, verified, wallet_address, created_at")
        .eq("id", id)
        .single(),
      supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", id),
      supabase
        .from("rentals")
        .select("id", { count: "exact", head: true })
        .eq("renter_id", id),
    ])

    if (userResult.error) {
      if (userResult.error.code === "PGRST116") {
        return Response.json({ error: "User not found" }, { status: 404 })
      }
      return Response.json({ error: userResult.error.message }, { status: 500 })
    }

    // Fetch ratings by wallet address
    let avg_rating: number | null = null
    let rating_count = 0
    const walletAddress = userResult.data.wallet_address
    if (walletAddress) {
      const { data: ratingsData } = await supabase
        .from("ratings")
        .select("score")
        .eq("target_wallet", walletAddress)
      if (ratingsData && ratingsData.length > 0) {
        rating_count = ratingsData.length
        avg_rating = ratingsData.reduce((sum: number, r: { score: number }) => sum + r.score, 0) / ratingsData.length
      }
    }

    return Response.json({
      ...userResult.data,
      listing_count: listingsResult.count ?? 0,
      rental_count: rentalsResult.count ?? 0,
      avg_rating,
      rating_count,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch user"
    return Response.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { wallet_address } = await req.json()

    if (!wallet_address) {
      return Response.json({ error: "wallet_address is required" }, { status: 400 })
    }

    const { error } = await supabase
      .from("users")
      .update({ wallet_address })
      .eq("id", id)

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update user"
    return Response.json({ error: message }, { status: 500 })
  }
}
