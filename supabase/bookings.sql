-- Dry Tickets: rate limit for the booking email function. Run once in the Supabase SQL editor.
-- Safe to re-run.
--
-- Bookings themselves are not stored — they are only emailed. This table holds a salted hash
-- of the sender's IP and a timestamp, kept for one day, so the function can refuse floods.

create table if not exists public.booking_attempts (
  id      bigint generated always as identity primary key,
  ip_hash text not null,
  at      timestamptz not null default now()
);

create index if not exists booking_attempts_ip_at on public.booking_attempts (ip_hash, at);

-- Only the edge function (service role, which bypasses RLS) touches this table.
alter table public.booking_attempts enable row level security;
revoke all on public.booking_attempts from anon, authenticated;

-- Records an attempt and returns whether it is within limits:
-- at most 5 per IP per hour, and 150 site-wide per day (each booking sends 2 emails;
-- Gmail allows ~500 a day).
create or replace function public.booking_attempt(p_ip_hash text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  per_ip int;
  per_day int;
begin
  delete from public.booking_attempts where at < now() - interval '1 day';

  select count(*) into per_ip
    from public.booking_attempts
   where ip_hash = p_ip_hash and at > now() - interval '1 hour';
  select count(*) into per_day from public.booking_attempts;

  if per_ip >= 5 or per_day >= 150 then
    return false;
  end if;

  insert into public.booking_attempts (ip_hash) values (p_ip_hash);
  return true;
end
$$;

revoke execute on function public.booking_attempt(text) from public, anon, authenticated;
grant execute on function public.booking_attempt(text) to service_role;
