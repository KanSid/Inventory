-- Migration: Remove color field from categories table
-- This removes the color column that was previously used for category visualization

ALTER TABLE public.categories DROP COLUMN color;
