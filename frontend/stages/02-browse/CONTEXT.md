# Stage 02: Browse + Item Detail

## Input

| Source | What | Why |
|--------|------|-----|
| frontend/CONTEXT.md | ItemCard, ListingGrid components | What to build |
| backend/CONTEXT.md | GET /api/listings, GET /api/listings/[id] | API shape |

## Process

### Step 1: Build ItemCard component
File: `components/ItemCard.tsx`
- Props: `{ id, title, photos, price_per_day, deposit_amount }`
- Shows: first photo, title, "$X/day", "Deposit: $Y", link to /item/[id]

### Step 2: Build app/page.tsx (homepage)
- Fetch from GET /api/listings (server component)
- Render `<ListingGrid>` of `<ItemCard>` components
- Empty state if no listings

### Step 3: Build app/item/[id]/page.tsx
- Fetch single listing from GET /api/listings/[id]
- Show: all photos (carousel), title, description, price, deposit, owner rating
- "Rent" button → opens RentModal (stub for now, implemented in stage 04)

## Output

Homepage shows listing grid. Item detail page works.

## Completion

Proceed to `stages/03-list-item/`
