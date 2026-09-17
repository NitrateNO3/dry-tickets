-- Dry Tickets: events table + row-level security.
-- Run once in the Supabase SQL editor.

create table if not exists public.events (
  slug         text primary key,
  title        text not null,
  description  text not null default '',
  image        text not null,
  start        timestamptz,
  "end"        timestamptz,
  rating       numeric,
  rating_count integer,
  venue        text,
  street       text,
  city         text,
  metro        text not null,
  region       text,
  postcode     text,
  country      text,
  artists      jsonb not null default '[]'::jsonb,
  tiers        jsonb not null default '[]'::jsonb,
  low          numeric,
  high         numeric,
  category     text not null,
  presale      boolean not null default false,
  updated_at   timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

alter table public.events enable row level security;

-- Anyone can read; only a signed-in admin can write.
drop policy if exists "events read" on public.events;
create policy "events read" on public.events
  for select to anon, authenticated using (true);

drop policy if exists "events write" on public.events;
create policy "events write" on public.events
  for all to authenticated using (true) with check (true);
