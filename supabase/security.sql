-- Dry Tickets: security hardening. Run once in the Supabase SQL editor, after schema.sql.
-- Safe to re-run.
--
-- BEFORE RUNNING: replace REPLACE_WITH_ADMIN_EMAIL (step 3) with the admin's login email.
-- AFTER RUNNING:  sign out of /admin and sign back in, so the login token carries the admin role.

begin;

-- 1. Data fix ---------------------------------------------------------------------------
-- Shows ending after midnight were imported with the start date on the end time
-- (e.g. starts 16 Oct 9pm, "ends" 16 Oct 12am). Move those ends to the next day so the
-- end >= start constraint below can be added.
update public.events
   set "end" = "end" + interval '1 day'
 where "end" < start;

-- 2. Admin role check --------------------------------------------------------------------
-- app_metadata can only be written server-side (SQL or the service key), never by the
-- signed-in user, so this cannot be self-granted.
create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
$$;

-- 3. Grant the role to the admin account --------------------------------------------------
do $$
begin
  update auth.users
     set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
   where email = 'REPLACE_WITH_ADMIN_EMAIL';
  if not found then
    raise exception 'No user with that email. Edit step 3 of security.sql and run it again.';
  end if;
end $$;

-- 4. Row-level security: anyone reads, only the admin role writes --------------------------
alter table public.events enable row level security;

drop policy if exists "events write"  on public.events;
drop policy if exists "events insert" on public.events;
drop policy if exists "events update" on public.events;
drop policy if exists "events delete" on public.events;

create policy "events insert" on public.events
  for insert to authenticated
  with check ((select public.is_admin()));

create policy "events update" on public.events
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "events delete" on public.events
  for delete to authenticated
  using ((select public.is_admin()));

-- Signed-out visitors can only read. TRUNCATE ignores RLS, so nobody gets it via the API.
revoke insert, update, delete on public.events from anon;
revoke truncate, references, trigger on public.events from anon, authenticated;

-- 5. Validators for the jsonb columns --------------------------------------------------------
-- Every cast is behind a type check, so malformed input returns false instead of erroring.
create or replace function public.valid_tiers(t jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case
    when jsonb_typeof(t) <> 'array' or jsonb_array_length(t) > 100 then false
    else not exists (
      select 1
        from jsonb_array_elements(t) e
       where case
               when jsonb_typeof(e) <> 'object' then true
               when jsonb_typeof(e -> 'name') is distinct from 'string' then true
               when char_length(e ->> 'name') not between 1 and 120 then true
               when jsonb_typeof(e -> 'price') is distinct from 'number' then true
               when (e ->> 'price')::numeric not between 0 and 100000 then true
               when coalesce(e ->> 'availability', '') not in ('InStock', 'LimitedAvailability', 'SoldOut') then true
               else false
             end
    )
  end
$$;

create or replace function public.valid_artists(a jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case
    when jsonb_typeof(a) <> 'array' or jsonb_array_length(a) > 50 then false
    else not exists (
      select 1
        from jsonb_array_elements(a) e
       where case
               when jsonb_typeof(e) <> 'object' then true
               when jsonb_typeof(e -> 'name') is distinct from 'string' then true
               when char_length(e ->> 'name') not between 1 and 120 then true
               when e -> 'image' is null or jsonb_typeof(e -> 'image') = 'null' then false
               when jsonb_typeof(e -> 'image') <> 'string' then true
               when (e ->> 'image') !~ '^https://' or char_length(e ->> 'image') > 1000 then true
               else false
             end
    )
  end
$$;

-- 6. Field constraints (the database is the authority; the admin form mirrors these) -------
alter table public.events
  drop constraint if exists events_slug_format,
  drop constraint if exists events_title_len,
  drop constraint if exists events_description_len,
  drop constraint if exists events_image_https,
  drop constraint if exists events_metro_len,
  drop constraint if exists events_category_len,
  drop constraint if exists events_text_len,
  drop constraint if exists events_postcode_len,
  drop constraint if exists events_rating_range,
  drop constraint if exists events_rating_count_min,
  drop constraint if exists events_end_after_start,
  drop constraint if exists events_tiers_valid,
  drop constraint if exists events_artists_valid;

alter table public.events
  add constraint events_slug_format      check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 160),
  add constraint events_title_len        check (char_length(title) between 1 and 200),
  add constraint events_description_len  check (char_length(description) <= 5000),
  add constraint events_image_https      check (image ~ '^https://' and char_length(image) <= 1000),
  add constraint events_metro_len        check (char_length(metro) between 1 and 80),
  add constraint events_category_len     check (char_length(category) between 1 and 80),
  add constraint events_text_len         check (
    coalesce(char_length(venue), 0)   <= 200 and
    coalesce(char_length(street), 0)  <= 200 and
    coalesce(char_length(city), 0)    <= 200 and
    coalesce(char_length(region), 0)  <= 200 and
    coalesce(char_length(country), 0) <= 200
  ),
  add constraint events_postcode_len     check (postcode is null or char_length(postcode) <= 10),
  add constraint events_rating_range     check (rating is null or rating between 0 and 5),
  add constraint events_rating_count_min check (rating_count is null or rating_count >= 0),
  add constraint events_end_after_start  check ("end" is null or start is null or "end" >= start),
  add constraint events_tiers_valid      check (public.valid_tiers(tiers)),
  add constraint events_artists_valid    check (public.valid_artists(artists));

-- 7. Server-owned fields ------------------------------------------------------------------------
-- low/high prices and updated_at are always recomputed here; whatever the client sends is ignored.
create or replace function public.events_before_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  select min((e ->> 'price')::numeric), max((e ->> 'price')::numeric)
    into new.low, new.high
    from jsonb_array_elements(case when jsonb_typeof(new.tiers) = 'array' then new.tiers else '[]'::jsonb end) e
   where jsonb_typeof(e -> 'price') = 'number';
  return new;
end
$$;

drop trigger if exists events_set_updated_at on public.events;
drop trigger if exists events_before_write on public.events;
create trigger events_before_write
  before insert or update on public.events
  for each row execute function public.events_before_write();

commit;
