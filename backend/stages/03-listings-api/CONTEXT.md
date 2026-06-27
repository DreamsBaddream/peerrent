# Stage 03: Listings API

## Input

| Source | What | Why |
|--------|------|-----|
| backend/CONTEXT.md | /api/listings routes | What to build |
| shared/references/casper-api.md | Supabase client patterns | DB access |

## Process

### Step 1: GET /api/listings/route.ts
- Fetch all listings where is_available = true from Supabase
- Return array of listing objects

### Step 2: POST /api/listings/route.ts
- Auth check (user must be verified)
- Accept: `{ title, description, price_per_day, deposit_amount, photos[] }`
- Upload photos to Supabase Storage → get public URLs
- Insert listing row in Supabase
- Return `{ listingId }`

### Step 3: GET /api/listings/[id]/route.ts
- Fetch single listing by id
- Join with owner info (username, rating)
- Return full listing object

### Step 4: Photo upload helper
```typescript
// lib/uploadPhoto.ts
export async function uploadPhoto(file: File, path: string): Promise<string> {
  const { data } = await supabase.storage
    .from("peerrent-photos")
    .upload(path, file)
  return supabase.storage.from("peerrent-photos").getPublicUrl(data!.path).data.publicUrl
}
```

## Output

3 working listing API routes. Owner can create listing with photos.

## Completion

Proceed to `stages/04-rental-api/`
