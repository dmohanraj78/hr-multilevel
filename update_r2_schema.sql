-- ============================================================
-- SQL Schema Migration: Update round_2_evaluation table
--
-- This script adds 4 new columns to the round_2_evaluation table
-- to separate the combined inputs into dedicated columns, and
-- migrates existing concatenated data.
--
-- Run this in your Supabase Dashboard → SQL Editor → Run.
-- Project: mujqmdmzloizqhglayxe
-- ============================================================

-- 1. Add new columns if they do not exist
ALTER TABLE public.round_2_evaluation 
ADD COLUMN IF NOT EXISTS contact_status TEXT,
ADD COLUMN IF NOT EXISTS problem_fit TEXT,
ADD COLUMN IF NOT EXISTS tech_depth TEXT,
ADD COLUMN IF NOT EXISTS latency_considerations TEXT;

-- 2. Populate the new columns from existing solves_business_problem and product_depth columns
UPDATE public.round_2_evaluation
SET 
  contact_status = CASE 
    WHEN solves_business_problem LIKE 'Contact: %' THEN 
      split_part(split_part(solves_business_problem, 'Contact: ', 2), ' | ', 1)
    WHEN solves_business_problem IN ('Yet to Speak', 'Spoke', 'Scheduled', 'No response') THEN 
      solves_business_problem
    ELSE 
      NULL 
  END,
  problem_fit = CASE 
    WHEN solves_business_problem LIKE '%Fit: %' THEN 
      split_part(solves_business_problem, 'Fit: ', 2)
    WHEN solves_business_problem IN ('Yes', 'Maybe', 'No') THEN 
      solves_business_problem
    ELSE 
      NULL 
  END,
  tech_depth = CASE 
    WHEN product_depth LIKE 'Depth: %' THEN 
      split_part(split_part(product_depth, 'Depth: ', 2), ' | ', 1)
    WHEN product_depth IN ('High', 'Medium', 'Low', 'None') THEN 
      product_depth
    ELSE 
      NULL 
  END,
  latency_considerations = CASE 
    WHEN product_depth LIKE '%Latency: %' THEN 
      split_part(product_depth, 'Latency: ', 2)
    WHEN product_depth NOT IN ('High', 'Medium', 'Low', 'None') THEN 
      product_depth
    ELSE 
      NULL 
  END
WHERE contact_status IS NULL 
   OR problem_fit IS NULL 
   OR tech_depth IS NULL 
   OR latency_considerations IS NULL;
