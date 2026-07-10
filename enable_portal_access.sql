-- ============================================================
-- Aviators Funnel Portals — one-time RLS setup
--
-- The three Vite portals connect with the *publishable* API key
-- (role: anon). RLS is enabled on the funnel tables but no
-- policies exist, so the portals see zero rows.
--
-- Run this once in: Supabase Dashboard → SQL Editor → Run.
-- Project: mujqmdmzloizqhglayxe
-- ============================================================

-- raw_submissions: portals read all rows; recruiter portal flips `analyzed`
drop policy if exists "portal read raw_submissions" on public.raw_submissions;
create policy "portal read raw_submissions"
  on public.raw_submissions for select to anon using (true);

drop policy if exists "portal update raw_submissions" on public.raw_submissions;
create policy "portal update raw_submissions"
  on public.raw_submissions for update to anon using (true) with check (true);

-- round_1_evaluation: recruiter portal upserts screening decisions
drop policy if exists "portal read round_1" on public.round_1_evaluation;
create policy "portal read round_1"
  on public.round_1_evaluation for select to anon using (true);

drop policy if exists "portal insert round_1" on public.round_1_evaluation;
create policy "portal insert round_1"
  on public.round_1_evaluation for insert to anon with check (true);

drop policy if exists "portal update round_1" on public.round_1_evaluation;
create policy "portal update round_1"
  on public.round_1_evaluation for update to anon using (true) with check (true);

-- round_2_evaluation: evaluator portal upserts vetting outcomes
drop policy if exists "portal read round_2" on public.round_2_evaluation;
create policy "portal read round_2"
  on public.round_2_evaluation for select to anon using (true);

drop policy if exists "portal insert round_2" on public.round_2_evaluation;
create policy "portal insert round_2"
  on public.round_2_evaluation for insert to anon with check (true);

drop policy if exists "portal update round_2" on public.round_2_evaluation;
create policy "portal update round_2"
  on public.round_2_evaluation for update to anon using (true) with check (true);

-- round_3_evaluation: executive portal upserts final verdicts
drop policy if exists "portal read round_3" on public.round_3_evaluation;
create policy "portal read round_3"
  on public.round_3_evaluation for select to anon using (true);

drop policy if exists "portal insert round_3" on public.round_3_evaluation;
create policy "portal insert round_3"
  on public.round_3_evaluation for insert to anon with check (true);

drop policy if exists "portal update round_3" on public.round_3_evaluation;
create policy "portal update round_3"
  on public.round_3_evaluation for update to anon using (true) with check (true);
