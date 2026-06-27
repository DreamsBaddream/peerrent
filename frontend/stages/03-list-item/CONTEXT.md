# Stage 03: Create Listing

## Input

| Source | What | Why |
|--------|------|-----|
| frontend/CONTEXT.md | PhotoUpload component | What to build |
| backend/CONTEXT.md | POST /api/listings | API shape |

## Process

### Step 1: Build app/list/page.tsx
Form fields:
- Title (text input)
- Description (textarea)
- Price per day (number input, CSPR)
- Deposit amount (number input, CSPR)
- Photos (PhotoUpload component — multi-file, preview thumbnails)

### Step 2: Build PhotoUpload component
File: `components/PhotoUpload.tsx`
- Accepts multiple images via file input
- Shows thumbnail preview for each
- Returns array of File objects to parent

### Step 3: On form submit
- POST to /api/listings with form data + files
- Show loading toast
- On success: redirect to /dashboard with success toast

### Step 4: Auth guard
- If user not logged in: redirect to /signup

## Output

Create listing page working. Photos upload, listing appears in browse grid.

## Completion

Proceed to `stages/04-rent-flow/`
