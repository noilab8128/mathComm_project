-- ========================================
-- Migration: Remove xp column from problems table
-- ========================================

ALTER TABLE public.problems DROP COLUMN IF EXISTS xp;
