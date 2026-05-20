-- Run this in Supabase SQL Editor (Dashboard → SQL → New query)
-- Stores each user's full workspace (pages, tasks, notes, history) in the cloud.

create table if not exists public.user_workspaces (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_workspaces enable row level security;

drop policy if exists "Users read own workspace" on public.user_workspaces;
drop policy if exists "Users insert own workspace" on public.user_workspaces;
drop policy if exists "Users update own workspace" on public.user_workspaces;
drop policy if exists "Users delete own workspace" on public.user_workspaces;

create policy "Users read own workspace"
  on public.user_workspaces for select
  using (auth.uid() = user_id);

create policy "Users insert own workspace"
  on public.user_workspaces for insert
  with check (auth.uid() = user_id);

create policy "Users update own workspace"
  on public.user_workspaces for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own workspace"
  on public.user_workspaces for delete
  using (auth.uid() = user_id);

create index if not exists idx_user_workspaces_updated on public.user_workspaces(updated_at desc);
