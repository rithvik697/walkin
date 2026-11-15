-- Run this once in the Supabase dashboard: SQL Editor → New query → paste → Run.

create table venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('cafe', 'brewery', 'restaurant', 'bowling')),
  area text not null,
  lat double precision not null,
  lng double precision not null,
  maps_url text,                                               -- Google Maps page: directions, menu, reviews
  price_level smallint check (price_level between 1 and 4),   -- 1 = ₹ ... 4 = ₹₹₹₹
  image_url text,                                              -- cover photo (optional)
  created_at timestamptz not null default now()
);

-- Each venue's private staff link is /update/<token>. Kept in its own table so the
-- public can read venues without ever seeing tokens.
create table venue_tokens (
  venue_id uuid primary key references venues (id) on delete cascade,
  token text not null unique default replace(gen_random_uuid()::text, '-', '')
);

create table status_reports (
  id bigint generated always as identity primary key,
  venue_id uuid not null references venues (id) on delete cascade,
  group_size text not null check (group_size in ('small', 'large')),
  level text not null check (level in ('none', 'short', 'medium', 'long', 'full')),
  source text not null default 'venue' check (source in ('venue', 'community', 'estimate')),
  reported_at timestamptz not null default now()
);

create index status_reports_recent on status_reports (reported_at desc);

-- Anyone can read venues and statuses; nobody can write directly or read tokens.
alter table venues enable row level security;
alter table venue_tokens enable row level security;
alter table status_reports enable row level security;

create policy "public read venues" on venues for select using (true);
create policy "public read statuses" on status_reports for select using (true);

-- Staff updates go through these functions, which check the token server-side.
create function venue_for_token(p_token text)
returns setof venues
language sql security definer set search_path = public
as $$
  select v.* from venues v join venue_tokens t on t.venue_id = v.id where t.token = p_token;
$$;

create function submit_venue_status(p_token text, p_group_size text, p_level text)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_id uuid;
begin
  select venue_id into v_id from venue_tokens where token = p_token;
  if v_id is null then
    raise exception 'invalid venue link';
  end if;
  insert into status_reports (venue_id, group_size, level, source)
  values (v_id, p_group_size, p_level, 'venue');
end;
$$;

grant execute on function venue_for_token(text) to anon;
grant execute on function submit_venue_status(text, text, text) to anon;

-- Give every new venue a staff token automatically.
create function create_venue_token() returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into venue_tokens (venue_id) values (new.id);
  return new;
end;
$$;

create trigger venues_create_token after insert on venues
for each row execute function create_venue_token();

-- To see each venue's staff link after adding venues:
--   select v.name, t.token from venues v join venue_tokens t on t.venue_id = v.id;
