alter table public.profiles
  add column if not exists full_name text,
  add column if not exists phone text,
  add column if not exists brand_name text,
  add column if not exists main_handle text;

alter table public.accounts
  add column if not exists handle text,
  add column if not exists email_label text,
  add column if not exists profile_type text not null default 'Principal';
