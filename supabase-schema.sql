-- StateChange — Supabase schema
-- Run this in the Supabase SQL editor to set up Phase 2 + 3 tables.

-- Search analytics (mirrors API analytics work at du UAE)
create table if not exists searches (
  id          uuid primary key default gen_random_uuid(),
  from_code   text not null,
  to_code     text not null,
  verdict     text,
  created_at  timestamptz default now()
);

-- Community reports
create table if not exists community_reports (
  id          uuid primary key default gen_random_uuid(),
  from_code   text not null,
  to_code     text not null,
  passport    text not null,
  report_text text not null,
  tags        text[] default '{}',
  created_at  timestamptz default now()
);

-- Row-level security: anyone can insert, only authenticated users can read all
alter table searches          enable row level security;
alter table community_reports enable row level security;

create policy "anon insert searches"
  on searches for insert to anon with check (true);

create policy "anon insert reports"
  on community_reports for insert to anon with check (true);

create policy "anon read reports"
  on community_reports for select to anon using (true);

-- Useful views for analytics dashboard (Phase 4)
create view popular_routes as
  select from_code, to_code, count(*) as search_count
  from searches
  group by from_code, to_code
  order by search_count desc;
