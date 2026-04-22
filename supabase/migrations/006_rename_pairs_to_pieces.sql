-- Migration 006: Rename 'pairs' to 'pieces' in shipment_items.input_unit
-- Migrates any existing data and updates the CHECK constraint

-- Migrate any existing 'pairs' values (safety net)
UPDATE public.shipment_items SET input_unit = 'pieces' WHERE input_unit = 'pairs';

-- Drop old CHECK constraint and add new one including 'pieces'
ALTER TABLE public.shipment_items DROP CONSTRAINT IF EXISTS shipment_items_input_unit_check;
ALTER TABLE public.shipment_items
  ADD CONSTRAINT shipment_items_input_unit_check
  CHECK (input_unit IN ('meters', 'yards', 'pieces'));
