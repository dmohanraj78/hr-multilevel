-- ============================================================
-- Aviators Funnel Portals — RLS for Google-authenticated users
--
-- The portals now sign users in with Google (@mondee.com) and connect with the
-- public ANON key. Once signed in, supabase-js sends the user's JWT, so every
-- request runs as the `authenticated` role — NOT `anon`. The old policies in
-- enable_portal_access.sql only granted access `to anon`, so logged-in users
-- saw zero rows ("database disconnected").
--
-- This script:
--   1. Drops the old anon policies (the anon key is public in the JS bundle, so
--      anon SELECT policies let anyone read candidate data without logging in —
--      a leak we close now that login is required).
--   2. Grants SELECT/INSERT/UPDATE to authenticated users whose email is on the
--      @mondee.com domain. Which portal a user may open is enforced in the
--      frontend (src/lib/access.js); this is the coarse data-layer gate.
--
-- Run once in: Supabase Dashboard → SQL Editor → Run.
-- Project: mujqmdmzloizqhglayxe
-- ============================================================

-- ---------- raw_submissions ----------
alter table public.raw_submissions enable row level security;

drop policy if exists "portal read raw_submissions"   on public.raw_submissions;
drop policy if exists "portal update raw_submissions"  on public.raw_submissions;
drop policy if exists "mondee read raw_submissions"    on public.raw_submissions;
drop policy if exists "mondee insert raw_submissions"  on public.raw_submissions;
drop policy if exists "mondee update raw_submissions"  on public.raw_submissions;

create policy "mondee read raw_submissions" on public.raw_submissions
  for select to authenticated
  using ((auth.jwt() ->> 'email') ilike '%@mondee.com');

create policy "mondee insert raw_submissions" on public.raw_submissions
  for insert to authenticated
  with check ((auth.jwt() ->> 'email') ilike '%@mondee.com');

create policy "mondee update raw_submissions" on public.raw_submissions
  for update to authenticated
  using ((auth.jwt() ->> 'email') ilike '%@mondee.com')
  with check ((auth.jwt() ->> 'email') ilike '%@mondee.com');

-- ---------- round_1_evaluation ----------
alter table public.round_1_evaluation enable row level security;

drop policy if exists "portal read round_1"           on public.round_1_evaluation;
drop policy if exists "portal insert round_1"         on public.round_1_evaluation;
drop policy if exists "portal update round_1"         on public.round_1_evaluation;
drop policy if exists "mondee read round_1_evaluation"   on public.round_1_evaluation;
drop policy if exists "mondee insert round_1_evaluation" on public.round_1_evaluation;
drop policy if exists "mondee update round_1_evaluation" on public.round_1_evaluation;

create policy "mondee read round_1_evaluation" on public.round_1_evaluation
  for select to authenticated
  using ((auth.jwt() ->> 'email') ilike '%@mondee.com');

create policy "mondee insert round_1_evaluation" on public.round_1_evaluation
  for insert to authenticated
  with check ((auth.jwt() ->> 'email') ilike '%@mondee.com');

create policy "mondee update round_1_evaluation" on public.round_1_evaluation
  for update to authenticated
  using ((auth.jwt() ->> 'email') ilike '%@mondee.com')
  with check ((auth.jwt() ->> 'email') ilike '%@mondee.com');

-- ---------- round_2_evaluation ----------
alter table public.round_2_evaluation enable row level security;

drop policy if exists "portal read round_2"           on public.round_2_evaluation;
drop policy if exists "portal insert round_2"         on public.round_2_evaluation;
drop policy if exists "portal update round_2"         on public.round_2_evaluation;
drop policy if exists "mondee read round_2_evaluation"   on public.round_2_evaluation;
drop policy if exists "mondee insert round_2_evaluation" on public.round_2_evaluation;
drop policy if exists "mondee update round_2_evaluation" on public.round_2_evaluation;

create policy "mondee read round_2_evaluation" on public.round_2_evaluation
  for select to authenticated
  using ((auth.jwt() ->> 'email') ilike '%@mondee.com');

create policy "mondee insert round_2_evaluation" on public.round_2_evaluation
  for insert to authenticated
  with check ((auth.jwt() ->> 'email') ilike '%@mondee.com');

create policy "mondee update round_2_evaluation" on public.round_2_evaluation
  for update to authenticated
  using ((auth.jwt() ->> 'email') ilike '%@mondee.com')
  with check ((auth.jwt() ->> 'email') ilike '%@mondee.com');

-- ---------- round_3_evaluation ----------
alter table public.round_3_evaluation enable row level security;

drop policy if exists "portal read round_3"           on public.round_3_evaluation;
drop policy if exists "portal insert round_3"         on public.round_3_evaluation;
drop policy if exists "portal update round_3"         on public.round_3_evaluation;
drop policy if exists "mondee read round_3_evaluation"   on public.round_3_evaluation;
drop policy if exists "mondee insert round_3_evaluation" on public.round_3_evaluation;
drop policy if exists "mondee update round_3_evaluation" on public.round_3_evaluation;

create policy "mondee read round_3_evaluation" on public.round_3_evaluation
  for select to authenticated
  using ((auth.jwt() ->> 'email') ilike '%@mondee.com');

create policy "mondee insert round_3_evaluation" on public.round_3_evaluation
  for insert to authenticated
  with check ((auth.jwt() ->> 'email') ilike '%@mondee.com');

create policy "mondee update round_3_evaluation" on public.round_3_evaluation
  for update to authenticated
  using ((auth.jwt() ->> 'email') ilike '%@mondee.com')
  with check ((auth.jwt() ->> 'email') ilike '%@mondee.com');
