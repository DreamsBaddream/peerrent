# Conventions

## File & Folder Naming
- Components: PascalCase (`ItemCard.tsx`)
- API routes: kebab-case (`/api/list-item`)
- Utilities: camelCase (`formatCspr.ts`)
- Supabase tables: snake_case (`rental_listings`)
- Smart contract functions: snake_case (`list_item`)

## TypeScript
- Strict mode on
- No `any` types
- Interfaces over types for objects
- Named exports over default exports (except pages)

## Next.js App Router
- Server components by default
- `"use client"` only when needed (event handlers, wallet)
- API routes in `/app/api/[route]/route.ts`
- Pages in `/app/[route]/page.tsx`

## Supabase
- Use service key only in server-side API routes
- Use anon key only in client-side code
- Row-level security (RLS) enabled on all tables

## Error Handling
- API routes return `{ error: string }` on failure with appropriate HTTP status
- Client shows toast notifications for errors (use react-hot-toast)

## Comments
- No comments unless the WHY is non-obvious
- No JSDoc or multi-line comment blocks
