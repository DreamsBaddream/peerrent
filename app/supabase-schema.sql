-- Run this in the Supabase SQL editor to create the schema

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null,
  wallet_address text unique,
  selfie_url text,
  verified boolean default false,
  created_at timestamptz default now()
);

create table if not exists listings (
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

create table if not exists rentals (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings(id) not null,
  renter_id uuid references users(id) not null,
  start_date date not null,
  end_date date not null,
  before_photos text[] default '{}',
  after_photos text[] default '{}',
  status text default 'active' check (status in ('active', 'returned', 'disputed')),
  damage_detected boolean,
  tx_hash text,
  created_at timestamptz default now()
);

create table if not exists ratings (
  id uuid primary key default gen_random_uuid(),
  rental_id uuid references rentals(id) not null,
  rater_id uuid references users(id) not null,
  target_wallet text,
  score integer not null check (score >= 1 and score <= 5),
  created_at timestamptz default now()
);

-- Enable RLS
alter table users enable row level security;
alter table listings enable row level security;
alter table rentals enable row level security;
alter table ratings enable row level security;

-- Basic RLS policies (allow all for hackathon — tighten for production)
create policy "Public listings" on listings for select using (true);
create policy "Auth insert listings" on listings for insert with check (true);
create policy "Auth update listings" on listings for update using (true);
create policy "Public rentals" on rentals for select using (true);
create policy "Auth insert rentals" on rentals for insert with check (true);
create policy "Auth update rentals" on rentals for update using (true);
create policy "Public users" on users for select using (true);
create policy "Auth insert users" on users for insert with check (true);
create policy "Auth update users" on users for update using (true);
create policy "Public ratings" on ratings for select using (true);
create policy "Auth insert ratings" on ratings for insert with check (true);
