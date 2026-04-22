-- Migration 007: Split piece stock into dedicated piece_batches table
-- Rolls table remains for fabric only; piece_batches tracks discrete item counts.

-- ============================================================
-- 1. Create piece_batches table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.piece_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  batch_number TEXT NOT NULL UNIQUE,
  initial_count INTEGER NOT NULL CHECK (initial_count > 0),
  current_count INTEGER NOT NULL CHECK (current_count >= 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'finished')),
  shipment_id UUID REFERENCES public.shipments(id),
  received_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.piece_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY piece_batches_select ON public.piece_batches FOR SELECT USING ((SELECT public.is_active_user()));
CREATE POLICY piece_batches_insert ON public.piece_batches FOR INSERT WITH CHECK ((SELECT public.is_manager_or_admin()));
CREATE POLICY piece_batches_update ON public.piece_batches FOR UPDATE USING ((SELECT public.is_manager_or_admin()));

CREATE INDEX IF NOT EXISTS idx_piece_batches_product ON public.piece_batches(product_id);
CREATE INDEX IF NOT EXISTS idx_piece_batches_status ON public.piece_batches(status);
CREATE INDEX IF NOT EXISTS idx_piece_batches_shipment ON public.piece_batches(shipment_id);

-- ============================================================
-- 2. generate_batch_number RPC (mirrors generate_roll_number)
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_batch_number(p_product_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_item_code TEXT;
  v_max_num INTEGER;
BEGIN
  SELECT item_code INTO v_item_code FROM public.products WHERE id = p_product_id;

  SELECT COALESCE(MAX(
    CAST(SUBSTRING(batch_number FROM LENGTH(v_item_code) + 3) AS INTEGER)
  ), 0) INTO v_max_num
  FROM public.piece_batches
  WHERE product_id = p_product_id;

  RETURN v_item_code || '-P' || (v_max_num + 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 3. Make stock_usage and stock_adjustments polymorphic
-- ============================================================

-- stock_usage: add nullable batch_id, drop NOT NULL on roll_id
ALTER TABLE public.stock_usage
  ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES public.piece_batches(id),
  ALTER COLUMN roll_id DROP NOT NULL;

ALTER TABLE public.stock_usage
  ADD CONSTRAINT stock_usage_exactly_one_target
  CHECK ((roll_id IS NOT NULL) <> (batch_id IS NOT NULL));

CREATE INDEX IF NOT EXISTS idx_stock_usage_batch ON public.stock_usage(batch_id);

-- stock_adjustments: same pattern
ALTER TABLE public.stock_adjustments
  ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES public.piece_batches(id),
  ALTER COLUMN roll_id DROP NOT NULL;

ALTER TABLE public.stock_adjustments
  ADD CONSTRAINT stock_adjustments_exactly_one_target
  CHECK ((roll_id IS NOT NULL) <> (batch_id IS NOT NULL));

CREATE INDEX IF NOT EXISTS idx_stock_adjustments_batch ON public.stock_adjustments(batch_id);

-- ============================================================
-- 4. Migrate existing piece-roll rows into piece_batches
--    (preserving IDs so FK refs in stock_usage/adjustments retarget cleanly)
-- ============================================================

INSERT INTO public.piece_batches (
  id, product_id, batch_number, initial_count, current_count,
  status, shipment_id, received_date, notes, created_at, updated_at
)
SELECT
  r.id,
  r.product_id,
  REPLACE(r.roll_number, '-R', '-P'),
  ROUND(r.initial_length_m)::INTEGER,
  ROUND(r.current_length_m)::INTEGER,
  r.status,
  r.shipment_id,
  r.received_date,
  r.notes,
  r.created_at,
  r.updated_at
FROM public.rolls r
JOIN public.products p ON p.id = r.product_id
JOIN public.categories c ON c.id = p.category_id
WHERE c.unit = 'pieces'
ON CONFLICT (id) DO NOTHING;

-- Retarget stock_usage rows that pointed to piece-rolls
UPDATE public.stock_usage
SET batch_id = roll_id, roll_id = NULL
WHERE roll_id IN (SELECT id FROM public.piece_batches);

-- Retarget stock_adjustments rows that pointed to piece-rolls
UPDATE public.stock_adjustments
SET batch_id = roll_id, roll_id = NULL
WHERE roll_id IN (SELECT id FROM public.piece_batches);

-- Remove the now-migrated rows from rolls
DELETE FROM public.rolls
WHERE id IN (SELECT id FROM public.piece_batches);

-- ============================================================
-- 5. Rebuild product_stock_summary with unit-agnostic columns
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
      COALESCE(SUM(b.current_count) FILTER (WHERE b.status = 'active'), 0)
  END AS total_stock,
  CASE
    WHEN c.unit = 'roll' THEN
      COUNT(r.id) FILTER (WHERE r.status = 'active')
    ELSE
      COUNT(b.id) FILTER (WHERE b.status = 'active')
  END AS active_count,
  CASE
    WHEN p.is_phased_out THEN 'phased_out'
    WHEN (
      CASE
        WHEN c.unit = 'roll' THEN
          COALESCE(SUM(r.current_length_m) FILTER (WHERE r.status = 'active' AND r.current_length_m > 2), 0)
        ELSE
          COALESCE(SUM(b.current_count) FILTER (WHERE b.status = 'active'), 0)
      END
    ) = 0 THEN 'out_of_stock'
    WHEN (
      CASE
        WHEN c.unit = 'roll' THEN
          COALESCE(SUM(r.current_length_m) FILTER (WHERE r.status = 'active' AND r.current_length_m > 2), 0)
        ELSE
          COALESCE(SUM(b.current_count) FILTER (WHERE b.status = 'active'), 0)
      END
    ) <= p.low_stock_threshold THEN 'low_stock'
    ELSE 'in_stock'
  END AS stock_status
FROM public.products p
LEFT JOIN public.categories c ON c.id = p.category_id
LEFT JOIN public.rolls r ON r.product_id = p.id
LEFT JOIN public.piece_batches b ON b.product_id = p.id
GROUP BY
  p.id, p.item_code, p.description, p.category_id, p.sub_type, p.image_url,
  p.low_stock_threshold, p.is_phased_out, p.type, p.costing_category,
  p.design_family, p.comment, c.unit;

-- Recreate inventory.products view (depends on product_stock_summary indirectly via products)
CREATE OR REPLACE VIEW inventory.products AS
  SELECT id, item_code, description, category_id, sub_type, image_url,
    low_stock_threshold AS reorder_level, is_phased_out, comment AS notes,
    created_at, updated_at
  FROM public.products;
