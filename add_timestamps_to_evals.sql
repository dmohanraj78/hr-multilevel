-- ============================================================
-- SQL Schema Migration: Add Timestamps & Triggers
--
-- This script adds created_at and updated_at columns to the
-- three evaluation tables, creates a function and triggers to
-- automatically update the updated_at column on edit, and
-- backfills existing rows with submission_date.
--
-- Run this in your Supabase Dashboard → SQL Editor → Run.
-- ============================================================

-- 1. Add created_at and updated_at columns to round_1_evaluation
ALTER TABLE public.round_1_evaluation 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Add created_at and updated_at columns to round_2_evaluation
ALTER TABLE public.round_2_evaluation 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Add created_at and updated_at columns to round_3_evaluation
ALTER TABLE public.round_3_evaluation 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. Create trigger function to auto-update updated_at on change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Attach triggers to tables
DROP TRIGGER IF EXISTS update_r1_updated_at ON public.round_1_evaluation;
CREATE TRIGGER update_r1_updated_at 
BEFORE UPDATE ON public.round_1_evaluation 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_r2_updated_at ON public.round_2_evaluation;
CREATE TRIGGER update_r2_updated_at 
BEFORE UPDATE ON public.round_2_evaluation 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_r3_updated_at ON public.round_3_evaluation;
CREATE TRIGGER update_r3_updated_at 
BEFORE UPDATE ON public.round_3_evaluation 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 6. Backfill existing records' timestamps using submission_date as a starting point
UPDATE public.round_1_evaluation r1
SET created_at = COALESCE(r.submission_date, NOW()),
    updated_at = COALESCE(r.submission_date, NOW())
FROM public.raw_submissions r 
WHERE r1.id = r.id;

UPDATE public.round_2_evaluation r2
SET created_at = COALESCE(r.submission_date, NOW()),
    updated_at = COALESCE(r.submission_date, NOW())
FROM public.raw_submissions r 
WHERE r2.id = r.id;

UPDATE public.round_3_evaluation r3
SET created_at = COALESCE(r.submission_date, NOW()),
    updated_at = COALESCE(r.submission_date, NOW())
FROM public.raw_submissions r 
WHERE r3.id = r.id;
