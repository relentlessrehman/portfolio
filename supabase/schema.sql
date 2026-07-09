-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New
-- query) after creating your project. See docs/BACKEND.md for the full
-- setup walkthrough.
--
-- Both tables allow anonymous INSERT only — no read, update, or delete for
-- the anon role. The private dashboard (Phase 9) reads through the
-- service-role key, which bypasses RLS entirely and never touches the
-- client bundle.

create extension if not exists pgcrypto;

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table contact_messages enable row level security;

drop policy if exists "Anyone can submit a contact message" on contact_messages;
create policy "Anyone can submit a contact message"
  on contact_messages
  for insert
  to anon
  with check (true);

create table if not exists page_events (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  referrer text,
  created_at timestamptz not null default now()
);

alter table page_events enable row level security;

drop policy if exists "Anyone can log a page view" on page_events;
create policy "Anyone can log a page view"
  on page_events
  for insert
  to anon
  with check (true);

create index if not exists page_events_created_at_idx on page_events (created_at desc);
create index if not exists contact_messages_created_at_idx on contact_messages (created_at desc);
