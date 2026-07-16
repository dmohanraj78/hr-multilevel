-- ============================================================
-- Link round_2_evaluation & round_3_evaluation to round_1_evaluation
--
-- All four funnel tables share the same primary key `id`
-- (id = raw_submissions.id). round_2 / round_3 already have a
-- foreign key to raw_submissions, which is why the portals can embed
--   round_2_evaluation?select=*,raw_submissions(*)
--
-- This adds a foreign key from round_2 / round_3 -> round_1_evaluation
-- so PostgREST/Supabase can ALSO embed round_1 data directly:
--   round_2_evaluation?select=*,round_1_evaluation(*)
--   round_3_evaluation?select=*,round_1_evaluation(*)
--
-- Safe to run: referential integrity was verified (every round_2/round_3
-- id already exists in round_1_evaluation; zero orphans).
--
-- Run once in: Supabase Dashboard -> SQL Editor -> Run.
-- Project: mujqmdmzloizqhglayxe
-- ============================================================

-- round_1_evaluation.id must be unique to be referenced.
-- (It is the primary key; this line is a harmless no-op guard if a PK
--  already exists — remove it if it errors saying the PK already exists.)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.round_1_evaluation'::regclass
      AND contype IN ('p', 'u')
  ) THEN
    ALTER TABLE public.round_1_evaluation ADD PRIMARY KEY (id);
  END IF;
END $$;

-- FK: round_2_evaluation.id -> round_1_evaluation.id
ALTER TABLE public.round_2_evaluation
  DROP CONSTRAINT IF EXISTS round_2_evaluation_round_1_id_fkey;
ALTER TABLE public.round_2_evaluation
  ADD CONSTRAINT round_2_evaluation_round_1_id_fkey
  FOREIGN KEY (id) REFERENCES public.round_1_evaluation (id) ON DELETE CASCADE;

-- FK: round_3_evaluation.id -> round_1_evaluation.id
ALTER TABLE public.round_3_evaluation
  DROP CONSTRAINT IF EXISTS round_3_evaluation_round_1_id_fkey;
ALTER TABLE public.round_3_evaluation
  ADD CONSTRAINT round_3_evaluation_round_1_id_fkey
  FOREIGN KEY (id) REFERENCES public.round_1_evaluation (id) ON DELETE CASCADE;

-- Tell PostgREST to reload its schema cache so the new relationships
-- are usable immediately (otherwise it can take up to ~10 min).
NOTIFY pgrst, 'reload schema';

-- ------------------------------------------------------------
-- After running, these queries will work (verify in SQL editor or REST):
--   select id, round_1_evaluation from round_2_evaluation limit 1;      -- via API embed
--   /rest/v1/round_2_evaluation?select=*,round_1_evaluation(tier,total,City,State,Country)
--   /rest/v1/round_3_evaluation?select=*,round_1_evaluation(*)
-- ------------------------------------------------------------
