# Stage 01: Supabase Schema

## Input

| Source | What | Why |
|--------|------|-----|
| backend/CONTEXT.md | Table definitions | What to create |

## Process

### Step 1: Create Supabase project
Go to supabase.com → New project → note URL + keys → add to .env

### Step 2: Run SQL in Supabase SQL editor

```sql
-- users
create table users (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null,
  wallet_address text unique,
  selfie_url text,
  verified boolean default false,
  created_at timestamptz default now()
);

-- listings
create table listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references users(id) not null,
  title text not null,
  description text,
  price_per_day numeric not null,
  deposit_amount numeric not null,
  photos text[] default '{}',
  casper_item_id text,
  is_available boolean default true,
  created_at timestamptz default now()
);

-- rentals
create table rentals (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings(id) not null,
  renter_id uuid references users(id) not null,
  start_date date not null,
  end_date date not null,
  before_photos text[] default '{}',
  after_photos text[] default '{}',
  status text default 'active',
  damage_detected boolean,
  created_at timestamptz default now()
);
```

### Step 3: Enable RLS on all tables
```sql
alter table users enable row level security;
alter table listings enable row level security;
alter table rentals enable row level security;
```

### Step 4: Create Supabase Storage bucket
Name: `peerrent-photos` — public bucket for item + rental photos.

## Output

All 3 tables created. RLS enabled. Storage bucket ready. .env populated.

## Completion

Proceed to `stages/02-auth/`
