alter table public.profiles
  add column if not exists full_name text;

alter table public.profiles
  add column if not exists phone text;

alter table public.profiles
  add column if not exists brand_name text;

alter table public.profiles
  add column if not exists main_handle text;

alter table public.profiles
  add column if not exists subscription_status text default 'active';

update public.profiles
set subscription_status = 'active'
where subscription_status is null;

drop policy if exists "profiles_admin_select_all" on public.profiles;
drop policy if exists "profiles_admin_update_all" on public.profiles;

create or replace function public.admin_is_allowed()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) in ('aztekillertech@gmail.com', 'aztekillertry@gmail.com');
$$;

create or replace function public.admin_list_profiles()
returns table (
  id uuid,
  email text,
  username text,
  full_name text,
  phone text,
  brand_name text,
  main_handle text,
  subscription_status text,
  access_plan text,
  access_code text,
  access_expires_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_is_allowed() then
    raise exception 'No autorizado';
  end if;

  return query
  select
    p.id,
    p.email,
    p.username,
    p.full_name,
    p.phone,
    p.brand_name,
    p.main_handle,
    coalesce(p.subscription_status, 'active') as subscription_status,
    coalesce(p.access_plan, 'starter') as access_plan,
    p.access_code,
    p.access_expires_at,
    p.created_at
  from public.profiles p
  order by p.created_at desc;
end;
$$;

create or replace function public.admin_update_subscription(
  target_user_id uuid,
  next_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_is_allowed() then
    raise exception 'No autorizado';
  end if;

  if next_status not in ('active', 'past_due', 'blocked', 'canceled') then
    raise exception 'Estado invalido';
  end if;

  update public.profiles
  set subscription_status = next_status
  where id = target_user_id;
end;
$$;

create or replace function public.admin_update_plan(
  target_user_id uuid,
  next_plan text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_is_allowed() then
    raise exception 'No autorizado';
  end if;

  if next_plan not in ('starter', 'pro', 'elite', 'shield') then
    raise exception 'Plan invalido';
  end if;

  update public.profiles
  set
    access_plan = next_plan,
    subscription_status = case when next_plan = 'starter' then 'active' else coalesce(subscription_status, 'active') end
  where id = target_user_id;
end;
$$;

grant execute on function public.admin_is_allowed() to authenticated;
grant execute on function public.admin_list_profiles() to authenticated;
grant execute on function public.admin_update_subscription(uuid, text) to authenticated;
grant execute on function public.admin_update_plan(uuid, text) to authenticated;

create table if not exists public.appointment_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text,
  full_name text,
  phone text,
  brand_name text,
  message text,
  status text default 'requested',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.appointment_requests enable row level security;

drop policy if exists "appointment_requests_insert_own" on public.appointment_requests;
drop policy if exists "appointment_requests_select_own" on public.appointment_requests;

create policy "appointment_requests_insert_own" on public.appointment_requests
  for insert
  with check (auth.uid() = user_id);

create policy "appointment_requests_select_own" on public.appointment_requests
  for select
  using (auth.uid() = user_id or public.admin_is_allowed());

create or replace function public.admin_list_appointments()
returns table (
  id uuid,
  user_id uuid,
  email text,
  full_name text,
  phone text,
  brand_name text,
  message text,
  status text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_is_allowed() then
    raise exception 'No autorizado';
  end if;

  return query
  select
    a.id,
    a.user_id,
    a.email,
    a.full_name,
    a.phone,
    a.brand_name,
    a.message,
    coalesce(a.status, 'requested') as status,
    a.created_at,
    a.updated_at
  from public.appointment_requests a
  order by a.created_at desc;
end;
$$;

create or replace function public.admin_update_appointment(
  appointment_id uuid,
  next_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_is_allowed() then
    raise exception 'No autorizado';
  end if;

  if next_status not in ('requested', 'contacted', 'scheduled', 'done', 'canceled') then
    raise exception 'Estado de cita invalido';
  end if;

  update public.appointment_requests
  set
    status = next_status,
    updated_at = now()
  where id = appointment_id;
end;
$$;

grant execute on function public.admin_list_appointments() to authenticated;
grant execute on function public.admin_update_appointment(uuid, text) to authenticated;

create or replace function public.admin_list_account_reports()
returns table (
  user_id uuid,
  email text,
  username text,
  full_name text,
  brand_name text,
  account_id uuid,
  platform text,
  owner text,
  profile_type text,
  handle text,
  email_label text,
  last_review text,
  checks jsonb,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_is_allowed() then
    raise exception 'No autorizado';
  end if;

  return query
  select
    p.id as user_id,
    p.email,
    p.username,
    p.full_name,
    p.brand_name,
    a.id as account_id,
    a.platform,
    a.owner,
    a.profile_type,
    a.handle,
    a.email_label,
    a.last_review,
    coalesce(s.checks, '{}'::jsonb) as checks,
    coalesce(a.updated_at, s.updated_at, a.created_at) as updated_at
  from public.profiles p
  join public.accounts a on a.user_id = p.id
  left join public.security_state s on s.user_id = p.id
  order by p.created_at desc, a.platform asc, a.created_at asc;
end;
$$;

grant execute on function public.admin_list_account_reports() to authenticated;

alter table public.emergency_events
  add column if not exists account_id uuid references public.accounts(id) on delete set null,
  add column if not exists account_label text,
  add column if not exists event_type text,
  add column if not exists severity text default 'media',
  add column if not exists occurred_at timestamptz;

update public.emergency_events
set occurred_at = created_at
where occurred_at is null;

create or replace function public.admin_list_incidents()
returns table (
  id uuid,
  user_id uuid,
  email text,
  username text,
  full_name text,
  brand_name text,
  account_id uuid,
  account_label text,
  event_type text,
  severity text,
  message text,
  status text,
  occurred_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_is_allowed() then
    raise exception 'No autorizado';
  end if;

  return query
  select
    e.id,
    e.user_id,
    p.email,
    p.username,
    p.full_name,
    p.brand_name,
    e.account_id,
    coalesce(e.account_label, a.platform || ' ' || coalesce(a.profile_type, a.owner, '')) as account_label,
    coalesce(e.event_type, 'Incidente') as event_type,
    coalesce(e.severity, 'media') as severity,
    e.message,
    e.status,
    coalesce(e.occurred_at, e.created_at) as occurred_at,
    e.created_at
  from public.emergency_events e
  left join public.profiles p on p.id = e.user_id
  left join public.accounts a on a.id = e.account_id
  order by coalesce(e.occurred_at, e.created_at) desc;
end;
$$;

create or replace function public.admin_update_incident(
  incident_id uuid,
  next_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_is_allowed() then
    raise exception 'No autorizado';
  end if;

  if next_status not in ('open', 'reviewing', 'resolved', 'ignored') then
    raise exception 'Estado de incidente invalido';
  end if;

  update public.emergency_events
  set status = next_status
  where id = incident_id;
end;
$$;

grant execute on function public.admin_list_incidents() to authenticated;
grant execute on function public.admin_update_incident(uuid, text) to authenticated;

create table if not exists public.admin_notes (
  id uuid primary key default gen_random_uuid(),
  target_user_id uuid references auth.users(id) on delete set null,
  body text not null,
  created_by text,
  created_at timestamptz default now()
);

alter table public.admin_notes enable row level security;

drop policy if exists "admin_notes_admin_select" on public.admin_notes;
drop policy if exists "admin_notes_admin_insert" on public.admin_notes;

create policy "admin_notes_admin_select" on public.admin_notes
  for select
  using (public.admin_is_allowed());

create policy "admin_notes_admin_insert" on public.admin_notes
  for insert
  with check (public.admin_is_allowed());

create or replace function public.admin_list_notes()
returns table (
  id uuid,
  target_user_id uuid,
  email text,
  username text,
  full_name text,
  brand_name text,
  body text,
  created_by text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_is_allowed() then
    raise exception 'No autorizado';
  end if;

  return query
  select
    n.id,
    n.target_user_id,
    p.email,
    p.username,
    p.full_name,
    p.brand_name,
    n.body,
    n.created_by,
    n.created_at
  from public.admin_notes n
  left join public.profiles p on p.id = n.target_user_id
  order by n.created_at desc;
end;
$$;

create or replace function public.admin_create_note(
  target_user_id uuid,
  note_body text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_is_allowed() then
    raise exception 'No autorizado';
  end if;

  if length(trim(coalesce(note_body, ''))) = 0 then
    raise exception 'La nota no puede estar vacia';
  end if;

  insert into public.admin_notes (target_user_id, body, created_by)
  values (
    target_user_id,
    trim(note_body),
    lower(coalesce(auth.jwt() ->> 'email', ''))
  );
end;
$$;

grant execute on function public.admin_list_notes() to authenticated;
grant execute on function public.admin_create_note(uuid, text) to authenticated;
