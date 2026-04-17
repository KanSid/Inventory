-- Migration: Add supplier_id to shipment_items for multi-supplier support
-- Allows items within a single shipment to come from different suppliers

-- ============================================================
-- 1. Add supplier_id column to shipment_items
-- ============================================================

ALTER TABLE public.shipment_items
ADD COLUMN supplier_id UUID REFERENCES public.suppliers(id);

-- ============================================================
-- 2. Create index for efficient supplier lookups
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_shipment_items_supplier
ON public.shipment_items(supplier_id);

-- ============================================================
-- 3. Create index for finding shipments by supplier via items
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_shipment_items_supplier_shipment
ON public.shipment_items(supplier_id, shipment_id);
