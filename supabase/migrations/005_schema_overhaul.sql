-- Migration 005: Schema overhaul
-- Changes: category unit, product new fields, product_suppliers, shipment date simplification

-- Drop legacy inventory schema views that depend on columns being altered/dropped
DROP VIEW IF EXISTS inventory.products;
DROP VIEW IF EXISTS inventory.shipments;

-- ============================================================
-- 1. Add unit to categories ('roll' | 'pieces')
-- ============================================================
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS unit TEXT NOT NULL DEFAULT 'roll'
  CHECK (unit IN ('roll', 'pieces'));

-- ============================================================
-- 2. Add new columns to products
-- ============================================================
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN (
    'Embroidered', 'Sequined', 'Crochet', 'Beaded', 'Cotton matte',
    'Chantilly', 'Beaded (pearls in centre of flower)', 'Underlay',
    'Special', 'Custom floral'
  )),
  ADD COLUMN IF NOT EXISTS costing_category TEXT CHECK (costing_category IN (
    'Underlay', 'Crochet/Corded', 'Embroidered / Chantilly',
    'Sequined / Special Embroidered', 'Beaded / Premium Embroidered',
    'B/w Beaded & Extra Premium', 'Extra premium', 'Ask for rate'
  )),
  ADD COLUMN IF NOT EXISTS design_family TEXT,
  ADD COLUMN IF NOT EXISTS comment TEXT;

-- Migrate existing notes → comment, then drop notes
UPDATE public.products SET comment = notes WHERE notes IS NOT NULL AND comment IS NULL;
ALTER TABLE public.products DROP COLUMN IF EXISTS notes;

-- Drop stock_unit (now derived from category.unit)
ALTER TABLE public.products DROP COLUMN IF EXISTS stock_unit;

-- Recreate inventory.products with comment instead of notes
CREATE OR REPLACE VIEW inventory.products AS
  SELECT id, item_code, description, category_id, sub_type, image_url,
    low_stock_threshold AS reorder_level, is_phased_out, comment AS notes,
    created_at, updated_at
  FROM public.products;

-- ============================================================
-- 3. product_suppliers join table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.product_suppliers (
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (product_id, supplier_id)
);

ALTER TABLE public.product_suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY product_suppliers_select ON public.product_suppliers FOR SELECT USING ((SELECT public.is_active_user()));
CREATE POLICY product_suppliers_insert ON public.product_suppliers FOR INSERT WITH CHECK ((SELECT public.is_manager_or_admin()));
CREATE POLICY product_suppliers_delete ON public.product_suppliers FOR DELETE USING ((SELECT public.is_manager_or_admin()));

CREATE INDEX IF NOT EXISTS idx_product_suppliers_product ON public.product_suppliers(product_id);
CREATE INDEX IF NOT EXISTS idx_product_suppliers_supplier ON public.product_suppliers(supplier_id);

-- ============================================================
-- 4. Simplify shipments: single date, manual shipment_number
-- ============================================================
ALTER TABLE public.shipments
  ADD COLUMN IF NOT EXISTS date DATE;

-- Preserve existing date data
UPDATE public.shipments
  SET date = COALESCE(received_date, expected_date)
  WHERE date IS NULL;

ALTER TABLE public.shipments DROP COLUMN IF EXISTS expected_date;
ALTER TABLE public.shipments DROP COLUMN IF EXISTS received_date;

-- Remove auto-generation; shipment_number is now entered manually
ALTER TABLE public.shipments ALTER COLUMN shipment_number DROP DEFAULT;

-- Ensure supplier_id is nullable (supplier is on items, not shipment header)
ALTER TABLE public.shipments ALTER COLUMN supplier_id DROP NOT NULL;

-- Recreate inventory.shipments with date instead of expected_date/received_date
CREATE OR REPLACE VIEW inventory.shipments AS
  SELECT id, shipment_number, supplier_id, status, date,
    received_by, notes, created_at, updated_at
  FROM public.shipments;

-- ============================================================
-- 5. Rebuild product_stock_summary view
--    Roll stock: only count active rolls with current_length_m > 2
--    Pieces stock: count all active rolls normally
-- ============================================================
DROP VIEW IF EXISTS public.product_stock_summary;

CREATE VIEW public.product_stock_summary AS
SELECT
  p.id,
  p.item_code,
  p.description,
  p.category_id,
  p.sub_type,
  p.image_url,
  p.low_stock_threshold,
  p.is_phased_out,
  p.type,
  p.costing_category,
  p.design_family,
  p.comment,
  c.unit AS stock_unit,
  CASE
    WHEN c.unit = 'roll' THEN
      COALESCE(SUM(r.current_length_m) FILTER (WHERE r.status = 'active' AND r.current_length_m > 2), 0)
    ELSE
      COALESCE(SUM(r.current_length_m) FILTER (WHERE r.status = 'active'), 0)
  END AS total_stock_m,
  COUNT(r.id) FILTER (WHERE r.status = 'active') AS active_roll_count,
  CASE
    WHEN p.is_phased_out THEN 'phased_out'
    WHEN (
      CASE
        WHEN c.unit = 'roll' THEN
          COALESCE(SUM(r.current_length_m) FILTER (WHERE r.status = 'active' AND r.current_length_m > 2), 0)
        ELSE
          COALESCE(SUM(r.current_length_m) FILTER (WHERE r.status = 'active'), 0)
      END
    ) = 0 THEN 'out_of_stock'
    WHEN (
      CASE
        WHEN c.unit = 'roll' THEN
          COALESCE(SUM(r.current_length_m) FILTER (WHERE r.status = 'active' AND r.current_length_m > 2), 0)
        ELSE
          COALESCE(SUM(r.current_length_m) FILTER (WHERE r.status = 'active'), 0)
      END
    ) <= p.low_stock_threshold THEN 'low_stock'
    ELSE 'in_stock'
  END AS stock_status
FROM public.products p
LEFT JOIN public.categories c ON c.id = p.category_id
LEFT JOIN public.rolls r ON r.product_id = p.id
GROUP BY
  p.id, p.item_code, p.description, p.category_id, p.sub_type, p.image_url,
  p.low_stock_threshold, p.is_phased_out, p.type, p.costing_category,
  p.design_family, p.comment, c.unit;
