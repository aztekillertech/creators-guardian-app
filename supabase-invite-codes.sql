alter table public.profiles
  add column if not exists access_code text,
  add column if not exists access_plan text,
  add column if not exists access_days integer,
  add column if not exists access_source text,
  add column if not exists access_expires_at timestamptz;

create table if not exists public.invite_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  client_label text,
  plan_kind text not null default 'trial_30',
  duration_days integer,
  max_uses integer not null default 1,
  status text not null default 'active',
  notes text,
  assigned_name text,
  assigned_email text,
  expires_at timestamptz,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invite_code_claims (
  id uuid primary key default gen_random_uuid(),
  invite_code_id uuid not null references public.invite_codes(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  full_name text,
  claimed_at timestamptz not null default now()
);

alter table public.invite_codes enable row level security;
alter table public.invite_code_claims enable row level security;

drop policy if exists "invite_codes_admin_select" on public.invite_codes;
drop policy if exists "invite_codes_admin_update" on public.invite_codes;
drop policy if exists "invite_code_claims_admin_select" on public.invite_code_claims;

create policy "invite_codes_admin_select" on public.invite_codes
  for select
  using (public.admin_is_allowed());

create policy "invite_codes_admin_update" on public.invite_codes
  for update
  using (public.admin_is_allowed())
  with check (public.admin_is_allowed());

create policy "invite_code_claims_admin_select" on public.invite_code_claims
  for select
  using (public.admin_is_allowed());

create or replace function public.normalize_invite_duration(
  raw_plan text,
  raw_days integer
)
returns integer
language plpgsql
stable
as $$
begin
  if raw_days is not null and raw_days > 0 then
    return raw_days;
  end if;

  case coalesce(raw_plan, '')
    when 'trial_30' then return 30;
    when 'promo_30' then return 30;
    when 'family' then return null;
    when 'vip' then return 365;
    when 'agency' then return 365;
    else return null;
  end case;
end;
$$;

create or replace function public.make_invite_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  new_code text;
begin
  loop
    new_code := 'UGC-' || upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8));
    exit when not exists (select 1 from public.invite_codes where code = new_code);
  end loop;

  return new_code;
end;
$$;

create or replace function public.validate_invite_code(
  input_code text
)
returns table (
  valid boolean,
  message text,
  invite_id uuid,
  code text,
  client_label text,
  plan_kind text,
  duration_days integer,
  max_uses integer,
  used_count integer,
  remaining_uses integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  invite_row public.invite_codes%rowtype;
  claims_count integer;
begin
  select *
  into invite_row
  from public.invite_codes
  where code = upper(trim(coalesce(input_code, '')))
  limit 1;

  if invite_row.id is null then
    return query
    select false, 'Ese codigo no existe.', null::uuid, null::text, null::text, null::text, null::integer, 0, 0, 0;
    return;
  end if;

  select count(*)
  into claims_count
  from public.invite_code_claims
  where invite_code_id = invite_row.id;

  if invite_row.status <> 'active' then
    return query
    select false, 'Ese codigo no esta activo en este momento.', invite_row.id, invite_row.code, invite_row.client_label, invite_row.plan_kind, public.normalize_invite_duration(invite_row.plan_kind, invite_row.duration_days), invite_row.max_uses, claims_count, greatest(invite_row.max_uses - claims_count, 0);
    return;
  end if;

  if invite_row.expires_at is not null and invite_row.expires_at < now() then
    return query
    select false, 'Ese codigo ya vencio.', invite_row.id, invite_row.code, invite_row.client_label, invite_row.plan_kind, public.normalize_invite_duration(invite_row.plan_kind, invite_row.duration_days), invite_row.max_uses, claims_count, 0;
    return;
  end if;

  if claims_count >= invite_row.max_uses then
    return query
    select false, 'Ese codigo ya alcanzo su limite de uso.', invite_row.id, invite_row.code, invite_row.client_label, invite_row.plan_kind, public.normalize_invite_duration(invite_row.plan_kind, invite_row.duration_days), invite_row.max_uses, claims_count, 0;
    return;
  end if;

  return query
  select true, 'Codigo listo para activar acceso.', invite_row.id, invite_row.code, invite_row.client_label, invite_row.plan_kind, public.normalize_invite_duration(invite_row.plan_kind, invite_row.duration_days), invite_row.max_uses, claims_count, greatest(invite_row.max_uses - claims_count, 0);
end;
$$;

create or replace function public.claim_invite_code(
  input_code text,
  signup_email text,
  signup_name text default null,
  target_user_id uuid default null
)
returns table (
  success boolean,
  message text,
  plan_kind text,
  duration_days integer,
  access_expires_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  invite_row public.invite_codes%rowtype;
  claims_count integer;
  normalized_email text := lower(trim(coalesce(signup_email, '')));
  normalized_name text := nullif(trim(coalesce(signup_name, '')), '');
  resolved_days integer;
  resolved_expiry timestamptz;
  existing_claim_id uuid;
begin
  if normalized_email = '' then
    return query select false, 'Falta el correo del creador.', null::text, null::integer, null::timestamptz;
    return;
  end if;

  select *
  into invite_row
  from public.invite_codes
  where code = upper(trim(coalesce(input_code, '')))
  limit 1;

  if invite_row.id is null then
    return query select false, 'Ese codigo no existe.', null::text, null::integer, null::timestamptz;
    return;
  end if;

  select id
  into existing_claim_id
  from public.invite_code_claims
  where invite_code_id = invite_row.id
    and (
      lower(email) = normalized_email
      or (target_user_id is not null and user_id = target_user_id)
    )
  limit 1;

  if existing_claim_id is not null then
    resolved_days := public.normalize_invite_duration(invite_row.plan_kind, invite_row.duration_days);
    resolved_expiry := case when resolved_days is null then null else now() + make_interval(days => resolved_days) end;
    return query select true, 'Este codigo ya estaba ligado a esta cuenta.', invite_row.plan_kind, resolved_days, resolved_expiry;
    return;
  end if;

  select count(*)
  into claims_count
  from public.invite_code_claims
  where invite_code_id = invite_row.id;

  if invite_row.status <> 'active' then
    return query select false, 'Ese codigo no esta activo.', null::text, null::integer, null::timestamptz;
    return;
  end if;

  if invite_row.expires_at is not null and invite_row.expires_at < now() then
    return query select false, 'Ese codigo ya vencio.', null::text, null::integer, null::timestamptz;
    return;
  end if;

  if claims_count >= invite_row.max_uses then
    return query select false, 'Ese codigo ya se uso al maximo.', null::text, null::integer, null::timestamptz;
    return;
  end if;

  insert into public.invite_code_claims (invite_code_id, user_id, email, full_name)
  values (invite_row.id, target_user_id, normalized_email, normalized_name);

  resolved_days := public.normalize_invite_duration(invite_row.plan_kind, invite_row.duration_days);
  resolved_expiry := case when resolved_days is null then null else now() + make_interval(days => resolved_days) end;

  if target_user_id is not null then
    insert into public.profiles (
      id,
      email,
      username,
      full_name,
      subscription_status,
      access_code,
      access_plan,
      access_days,
      access_source,
      access_expires_at
    )
    values (
      target_user_id,
      normalized_email,
      split_part(normalized_email, '@', 1),
      normalized_name,
      'active',
      invite_row.code,
      invite_row.plan_kind,
      resolved_days,
      coalesce(invite_row.client_label, invite_row.assigned_name, 'Codigo privado'),
      resolved_expiry
    )
    on conflict (id) do update
    set
      email = excluded.email,
      full_name = coalesce(excluded.full_name, public.profiles.full_name),
      subscription_status = coalesce(public.profiles.subscription_status, 'active'),
      access_code = excluded.access_code,
      access_plan = excluded.access_plan,
      access_days = excluded.access_days,
      access_source = excluded.access_source,
      access_expires_at = excluded.access_expires_at;
  end if;

  update public.invite_codes
  set
    status = case
      when ((select count(*) from public.invite_code_claims where invite_code_id = invite_row.id) >= max_uses) then 'used'
      else status
    end,
    updated_at = now()
  where id = invite_row.id;

  return query
  select true, 'Codigo aplicado correctamente.', invite_row.plan_kind, resolved_days, resolved_expiry;
end;
$$;

create or replace function public.admin_generate_invite_code(
  client_label text default null,
  plan_kind text default 'trial_30',
  duration_days integer default null,
  max_uses integer default 1,
  notes text default null,
  assigned_name text default null,
  assigned_email text default null,
  expires_at timestamptz default null
)
returns table (
  id uuid,
  code text,
  plan_kind text,
  duration_days integer,
  max_uses integer,
  status text,
  client_label text,
  assigned_name text,
  assigned_email text,
  notes text,
  expires_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  generated_code text;
  new_row public.invite_codes%rowtype;
begin
  if not public.admin_is_allowed() then
    raise exception 'No autorizado';
  end if;

  if coalesce(max_uses, 0) < 1 then
    raise exception 'max_uses debe ser al menos 1';
  end if;

  generated_code := public.make_invite_code();

  insert into public.invite_codes (
    code,
    client_label,
    plan_kind,
    duration_days,
    max_uses,
    status,
    notes,
    assigned_name,
    assigned_email,
    expires_at,
    created_by
  )
  values (
    generated_code,
    nullif(trim(coalesce(client_label, '')), ''),
    coalesce(plan_kind, 'trial_30'),
    public.normalize_invite_duration(plan_kind, duration_days),
    max_uses,
    'active',
    nullif(trim(coalesce(notes, '')), ''),
    nullif(trim(coalesce(assigned_name, '')), ''),
    lower(nullif(trim(coalesce(assigned_email, '')), '')),
    expires_at,
    lower(coalesce(auth.jwt() ->> 'email', ''))
  )
  returning * into new_row;

  return query
  select
    new_row.id,
    new_row.code,
    new_row.plan_kind,
    new_row.duration_days,
    new_row.max_uses,
    new_row.status,
    new_row.client_label,
    new_row.assigned_name,
    new_row.assigned_email,
    new_row.notes,
    new_row.expires_at,
    new_row.created_at;
end;
$$;

create or replace function public.admin_list_invite_codes()
returns table (
  id uuid,
  code text,
  client_label text,
  plan_kind text,
  duration_days integer,
  max_uses integer,
  used_count integer,
  remaining_uses integer,
  status text,
  notes text,
  assigned_name text,
  assigned_email text,
  expires_at timestamptz,
  created_by text,
  created_at timestamptz,
  updated_at timestamptz,
  redeemed_emails text
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
    c.id,
    c.code,
    c.client_label,
    c.plan_kind,
    public.normalize_invite_duration(c.plan_kind, c.duration_days) as duration_days,
    c.max_uses,
    count(claims.id)::integer as used_count,
    greatest(c.max_uses - count(claims.id)::integer, 0) as remaining_uses,
    case
      when c.status = 'active' and c.expires_at is not null and c.expires_at < now() then 'expired'
      else c.status
    end as status,
    c.notes,
    c.assigned_name,
    c.assigned_email,
    c.expires_at,
    c.created_by,
    c.created_at,
    c.updated_at,
    coalesce(string_agg(distinct claims.email, ' · ' order by claims.email), '') as redeemed_emails
  from public.invite_codes c
  left join public.invite_code_claims claims on claims.invite_code_id = c.id
  group by c.id
  order by c.created_at desc;
end;
$$;

create or replace function public.admin_update_invite_code(
  invite_id uuid,
  next_status text default null,
  next_notes text default null,
  next_max_uses integer default null,
  next_expires_at timestamptz default null
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

  if next_status is not null and next_status not in ('active', 'paused', 'used', 'revoked') then
    raise exception 'Estado de codigo invalido';
  end if;

  update public.invite_codes
  set
    status = coalesce(next_status, status),
    notes = coalesce(next_notes, notes),
    max_uses = coalesce(next_max_uses, max_uses),
    expires_at = case when next_expires_at is null then expires_at else next_expires_at end,
    updated_at = now()
  where id = invite_id;
end;
$$;

grant execute on function public.normalize_invite_duration(text, integer) to anon, authenticated;
grant execute on function public.make_invite_code() to authenticated;
grant execute on function public.validate_invite_code(text) to anon, authenticated;
grant execute on function public.claim_invite_code(text, text, text, uuid) to anon, authenticated;
grant execute on function public.admin_generate_invite_code(text, text, integer, integer, text, text, text, timestamptz) to authenticated;
grant execute on function public.admin_list_invite_codes() to authenticated;
grant execute on function public.admin_update_invite_code(uuid, text, text, integer, timestamptz) to authenticated;

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
  access_code text,
  access_plan text,
  access_days integer,
  access_source text,
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
    p.access_code,
    p.access_plan,
    p.access_days,
    p.access_source,
    p.access_expires_at,
    p.created_at
  from public.profiles p
  order by p.created_at desc;
end;
$$;

grant execute on function public.admin_list_profiles() to authenticated;
