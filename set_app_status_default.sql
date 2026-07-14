-- ============================================================
-- Make round_1_evaluation.app_status default to 'Pending'
--
-- Existing NULL rows have already been updated to 'Pending' via
-- the REST API. This DDL makes the DEFAULT permanent so any row
-- inserted without an explicit app_status (e.g. by the import
-- pipeline) starts as 'Pending' instead of NULL.
--
-- Run once in: Supabase Dashboard -> SQL Editor -> Run.
-- Project: mujqmdmzloizqhglayxe
-- ============================================================

ALTER TABLE public.round_1_evaluation
  ALTER COLUMN app_status SET DEFAULT 'Pending';

-- Safety net for any rows that slipped in as NULL since the last cleanup
UPDATE public.round_1_evaluation
   SET app_status = 'Pending'
 WHERE app_status IS NULL;
