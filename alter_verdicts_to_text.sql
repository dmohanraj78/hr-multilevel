-- ============================================================
-- SQL Schema Migration: Convert status columns to TEXT
--
-- This script alters the `moved_to_round_3` and `verdict` columns
-- to be of type `TEXT` instead of `VARCHAR(15)` and `VARCHAR(10)`
-- to prevent any future "value too long" errors.
--
-- Run this in your Supabase Dashboard → SQL Editor → Run.
-- ============================================================

-- 1. Alter moved_to_round_3 in round_2_evaluation
ALTER TABLE public.round_2_evaluation 
ALTER COLUMN moved_to_round_3 TYPE TEXT;

-- 2. Alter verdict in round_3_evaluation
ALTER TABLE public.round_3_evaluation 
ALTER COLUMN verdict TYPE TEXT;
