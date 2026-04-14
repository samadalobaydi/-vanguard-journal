-- ============================================================
-- Vanguard Journal — Supabase Schema
-- Run this in your Supabase project's SQL Editor
-- ============================================================

-- ─── Profiles ────────────────────────────────────────────────
create table if not exists public.profiles (
  id                  uuid        references auth.users on delete cascade primary key,
  email               text,
  stripe_customer_id  text        unique,
  subscription_id     text,
  subscription_status text        not null default 'inactive',
  -- subscription_status values: 'active' | 'inactive' | 'past_due' | 'canceled' | 'trialing'
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ─── Journal Entries ─────────────────────────────────────────
create table if not exists public.journal_entries (
  id                  uuid        primary key default gen_random_uuid(),
  user_id             uuid        not null references auth.users on delete cascade,
  entry_date          date        not null,
  morning_intention   text,
  evening_review      text,
  tomorrow_target     text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  -- One entry per user per day
  unique (user_id, entry_date)
);

-- ─── Row Level Security ───────────────────────────────────────
alter table public.profiles        enable row level security;
alter table public.journal_entries enable row level security;

-- Profiles: users can read and update their own row
create policy "profiles: select own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles: insert own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Journal entries: full CRUD for own rows only
create policy "entries: select own"
  on public.journal_entries for select
  using (auth.uid() = user_id);

create policy "entries: insert own"
  on public.journal_entries for insert
  with check (auth.uid() = user_id);

create policy "entries: update own"
  on public.journal_entries for update
  using (auth.uid() = user_id);

create policy "entries: delete own"
  on public.journal_entries for delete
  using (auth.uid() = user_id);

-- ─── Auto-create profile on sign up ──────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Drop trigger if it already exists, then recreate
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ─── Updated_at trigger ───────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at        on public.profiles;
drop trigger if exists set_journal_entries_updated_at on public.journal_entries;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger set_journal_entries_updated_at
  before update on public.journal_entries
  for each row execute function public.set_updated_at();
