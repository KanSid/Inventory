-- ============================================================
-- Fix product_stock_summary: Total Stock was silently dropping
-- entire active rolls with current_length_m <= 2m from the sum,
-- while Active Rolls / stock_status counted them. This produced
-- inconsistent numbers (e.g. "Active Rolls: 1" but "Total Stock: 0m",
-- status "out_of_stock") for any product with a low-remainder roll.
-- Now that usage can be logged down to 0.01m, these remainders are
-- common, so the mismatch affected many products.
--
-- Fix: count all active rolls' current_length_m toward total_stock,
-- consistent with active_count and stock_status.
-- ============================================================
-- NOTE: this reflects the live schema's current product_stock_summary
-- definition (p.type_id / p.costing_category_id / p.design_family_id,
-- no p.sub_type), which has drifted from what earlier committed
-- migrations in this repo describe. Only the total_stock filter changes;
-- everything else is copied from the view as it exists in production.
CREATE OR REPLACE VIEW public.product_stock_summary AS
SELECT
  p.id,
  p.item_code,
  p.description,
  p.category_id,
  p.image_url,
  p.low_stock_threshold,
  p.is_phased_out,
  p.type_id,
  p.costing_category_id,
  p.design_family_id,
  p.comment,
  c.unit AS stock_unit,
  CASE
    WHEN c.unit = 'roll' THEN
      COALESCE(SUM(r.current_length_m) FILTER (WHERE r.status = 'active'), 0)
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
          COALESCE(SUM(r.current_length_m) FILTER (WHERE r.status = 'active'), 0)
        ELSE
          COALESCE(SUM(b.current_count) FILTER (WHERE b.status = 'active'), 0)
      END
    ) = 0 THEN 'out_of_stock'
    WHEN (
      CASE
        WHEN c.unit = 'roll' THEN
          COALESCE(SUM(r.current_length_m) FILTER (WHERE r.status = 'active'), 0)
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
  p.id, p.item_code, p.description, p.category_id, p.image_url,
  p.low_stock_threshold, p.is_phased_out, p.type_id, p.costing_category_id,
  p.design_family_id, p.comment, c.unit;
