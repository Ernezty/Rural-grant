-- Run this in Supabase: SQL Editor > New query > paste > Run

create table grants (
  id bigint generated always as identity primary key,
  title text not null,
  category text not null,
  state text not null default 'All',
  amount numeric not null,
  deadline date,
  description text not null,
  open boolean not null default true,
  created_at timestamptz not null default now()
);

create table applications (
  id bigint generated always as identity primary key,
  full_name text not null,
  phone text not null,
  state text not null,
  lga text not null,
  grant_title text not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- Security: lock both tables, then allow only what visitors need.
alter table grants enable row level security;
alter table applications enable row level security;

-- Anyone can read open grants.
create policy "public can read open grants"
  on grants for select using (open = true);

-- Anyone can submit an application, but nobody can read them from the website.
-- You view applications in the Supabase dashboard (Table Editor).
create policy "public can submit applications"
  on applications for insert with check (true);

-- Sample grants to start with
insert into grants (title, category, state, amount, deadline, description) values
('Smallholder Farmer Support', 'Farming', 'Kaduna', 150000, '2026-12-15', 'Seeds, fertiliser and tools for farmers working less than 5 hectares.'),
('Rural Trader Start-up Fund', 'Small business', 'Oyo', 100000, '2027-01-10', 'Capital for market traders and artisans starting or growing a small business.');
