# Stage 05: Return Flow

## Input

| Source | What | Why |
|--------|------|-----|
| frontend/CONTEXT.md | ReturnFlow component | What to build |
| backend/CONTEXT.md | POST /api/return, POST /api/rate | API shape |

## Process

### Step 1: Build app/return/[id]/page.tsx
- Show before-photos (from rental record) on left
- PhotoUpload for after-photos on right
- "Submit Return" button

### Step 2: On submit
- POST to /api/return with `{ rentalId, afterPhotos }`
- Show loading: "Checking for damage..."
- On response:
  - No damage: green toast "All good! Deposit refunded."
  - Damage: red toast "Damage detected: [reason]. Deposit held."

### Step 3: Rating prompt
After return completes, show rating modal:
- "How was your experience with [owner/renter]?"
- 5-star selector
- Submit → POST /api/rate

### Step 4: Build app/dashboard/page.tsx
- My listings section (owner view)
- Active rentals section (renter view) with "Return Item" button per active rental

## Output

Full return flow works end to end. Ratings submit. Dashboard shows all activity.

## Completion

Frontend complete. Full app is ready to demo.
