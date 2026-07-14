-- ============================================================
-- Permanent data-quality guard for round_1_evaluation
--
-- Enforces at the DATABASE level (no pipeline can bypass it):
--   1. Tiers are always stored in full form (T1 -> Tier 1, ...)
--   2. app_status defaults to 'Pending', never NULL
--   3. No duplicate candidates: an INSERT for a raw submission
--      whose email already has an evaluation under another id is
--      silently skipped, and that raw submission is marked
--      Analysis_status = 'Completed' so the scorer moves on.
--
-- Run once in: Supabase Dashboard -> SQL Editor -> Run.
-- Project: mujqmdmzloizqhglayxe
-- ============================================================

ALTER TABLE public.round_1_evaluation
  ALTER COLUMN app_status SET DEFAULT 'Pending';

CREATE OR REPLACE FUNCTION public.r1_quality_guard()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  new_email text;
  existing_id bigint;
BEGIN
  -- 1. normalize tier to full form
  NEW.tier := CASE upper(trim(coalesce(NEW.tier, '')))
    WHEN 'T1'  THEN 'Tier 1'
    WHEN 'T1+' THEN 'Tier 1+'
    WHEN 'T2'  THEN 'Tier 2'
    WHEN 'T2+' THEN 'Tier 2+'
    WHEN 'T3'  THEN 'Tier 3'
    WHEN 'T4'  THEN 'Tier 4'
    ELSE NEW.tier
  END;

  -- 2. app_status never NULL
  IF NEW.app_status IS NULL OR trim(NEW.app_status) = '' THEN
    NEW.app_status := 'Pending';
  END IF;

  -- 3. duplicate check (INSERT only): same email already evaluated?
  IF TG_OP = 'INSERT' THEN
    SELECT lower(trim(email)) INTO new_email
      FROM public.raw_submissions WHERE id = NEW.id;

    IF new_email IS NOT NULL AND new_email <> '' THEN
      SELECT r1.id INTO existing_id
        FROM public.round_1_evaluation r1
        JOIN public.raw_submissions rs ON rs.id = r1.id
       WHERE lower(trim(rs.email)) = new_email
         AND r1.id <> NEW.id
       LIMIT 1;

      IF existing_id IS NOT NULL THEN
        -- mark this raw submission handled and skip the insert
        UPDATE public.raw_submissions
           SET "Analysis_status" = 'Completed'
         WHERE id = NEW.id;
        RETURN NULL;  -- silently drop the duplicate evaluation
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_r1_quality_guard ON public.round_1_evaluation;
CREATE TRIGGER trg_r1_quality_guard
  BEFORE INSERT OR UPDATE ON public.round_1_evaluation
  FOR EACH ROW EXECUTE FUNCTION public.r1_quality_guard();
