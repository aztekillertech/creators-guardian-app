create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  username text,
  full_name text,
  phone text,
  brand_name text,
  main_handle text,
  subscription_status text default 'active',
  created_at timestamptz default now()
);

create table if not exists public.security_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  checks jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null default 'Nueva cuenta',
  owner text not null default 'Creador',
  handle text,
  email_label text,
  profile_type text not null default 'Principal',
  status text not null default 'Revisar',
  last_review text not null default 'Hoy',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.scan_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scan_type text not null,
  value text not null,
  risk_level text,
  risk_score integer,
  created_at timestamptz default now()
);

create table if not exists public.emergency_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  message text,
  status text not null default 'open',
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.security_state enable row level security;
alter table public.accounts enable row level security;
alter table public.scan_history enable row level security;
alter table public.emergency_events enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "security_state_select_own" on public.security_state
  for select using (auth.uid() = user_id);

create policy "security_state_insert_own" on public.security_state
  for insert with check (auth.uid() = user_id);

create policy "security_state_update_own" on public.security_state
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "accounts_select_own" on public.accounts
  for select using (auth.uid() = user_id);

create policy "accounts_insert_own" on public.accounts
  for insert with check (auth.uid() = user_id);

create policy "accounts_update_own" on public.accounts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "accounts_delete_own" on public.accounts
  for delete using (auth.uid() = user_id);

create policy "scan_history_select_own" on public.scan_history
  for select using (auth.uid() = user_id);

create policy "scan_history_insert_own" on public.scan_history
  for insert with check (auth.uid() = user_id);

create policy "emergency_events_select_own" on public.emergency_events
  for select using (auth.uid() = user_id);

create policy "emergency_events_insert_own" on public.emergency_events
  for insert with check (auth.uid() = user_id);
