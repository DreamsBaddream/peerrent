import { supabase } from "@/lib/supabase"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const ownerId = url.searchParams.get("owner_id")

    let query = supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false })

    if (ownerId) {
      query = query.eq("owner_id", ownerId)
    } else {
      query = query.eq("is_available", true)
    }

    const { data, error } = await query

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json(data)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch listings"
    return Response.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const price_per_day = parseFloat(formData.get("price_per_day") as string)
    const deposit_amount = parseFloat(formData.get("deposit_amount") as string)
    const owner_id = formData.get("owner_id") as string
    const casper_item_id = (formData.get("casper_item_id") as string) || null
    const photos = formData.getAll("photos") as File[]

    if (!title || !description || isNaN(price_per_day) || isNaN(deposit_amount) || !owner_id) {
      return Response.json(
        { error: "title, description, price_per_day, deposit_amount, and owner_id are required" },
        { status: 400 }
      )
    }

    // Upload each photo to Supabase Storage
    const photoUrls: string[] = []

    for (const photo of photos) {
      const arrayBuffer = await photo.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const ext = photo.name.split(".").pop() || "jpg"
      const fileName = `listings/${owner_id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from("peerrent-photos")
        .upload(fileName, buffer, {
          contentType: photo.type || "image/jpeg",
          upsert: false,
        })

      if (uploadError) {
        return Response.json({ error: `Photo upload failed: ${uploadError.message}` }, { status: 500 })
      }

      const { data: publicUrlData } = supabase.storage
        .from("peerrent-photos")
        .getPublicUrl(fileName)

      photoUrls.push(publicUrlData.publicUrl)
    }

    // Insert listing into Supabase
    const { data, error } = await supabase
      .from("listings")
      .insert({
        owner_id,
        title,
        description,
        price_per_day,
        deposit_amount,
        photos: photoUrls,
        casper_item_id,
        is_available: true,
      })
      .select("id")
      .single()

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ listingId: data.id })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create listing"
    return Response.json({ error: message }, { status: 500 })
  }
}
