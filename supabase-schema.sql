-- StateChange — Supabase schema (Phase 3)
-- Paste into Supabase SQL editor and run.

-- ── Searches (API analytics — every check logged) ─────────────────
create table if not exists searches (
  id          uuid primary key default gen_random_uuid(),
  from_code   text not null,
  to_code     text not null,
  verdict     text,
  user_id     uuid references auth.users(id) on delete set null,
  created_at  timestamptz default now()
);

create index if not exists searches_route_idx on searches (from_code, to_code);
create index if not exists searches_created_idx on searches (created_at desc);

-- ── Community reports ─────────────────────────────────────────────
create table if not exists community_reports (
  id           uuid primary key default gen_random_uuid(),
  from_code    text not null,
  to_code      text not null,
  passport     text not null,
  report_text  text not null,
  tags         text[] default '{}',
  user_id      uuid references auth.users(id) on delete set null,
  flagged      boolean default false,
  created_at   timestamptz default now()
);

create index if not exists reports_route_idx  on community_reports (from_code, to_code);
create index if not exists reports_created_idx on community_reports (created_at desc);

-- ── Row-level security ─────────────────────────────────────────────
alter table searches          enable row level security;
alter table community_reports enable row level security;

-- Searches: anon insert, no read (server-side only via service key)
create policy "anon can insert searches"
  on searches for insert to anon with check (true);

create policy "auth users can insert searches"
  on searches for insert to authenticated with check (true);

-- Community reports: anon insert + read (unflagged only)
create policy "anon can insert reports"
  on community_reports for insert to anon
  with check (length(report_text) >= 20 and length(report_text) <= 1000);

create policy "anon can read reports"
  on community_reports for select to anon
  using (flagged = false);

create policy "auth users can insert reports"
  on community_reports for insert to authenticated
  with check (length(report_text) >= 20 and length(report_text) <= 1000);

create policy "auth users can read reports"
  on community_reports for select to authenticated
  using (flagged = false);

-- ── Analytics views (Phase 4 dashboard) ───────────────────────────
create or replace view popular_routes as
  select
    from_code,
    to_code,
    count(*)                                    as search_count,
    count(*) filter (where verdict = 'free')    as free_count,
    count(*) filter (where verdict = 'voa')     as voa_count,
    count(*) filter (where verdict = 'visa')    as visa_count,
    max(created_at)                             as last_searched_at
  from searches
  group by from_code, to_code
  order by search_count desc;

create or replace view route_report_counts as
  select from_code, to_code, count(*) as report_count
  from community_reports
  where flagged = false
  group by from_code, to_code;
