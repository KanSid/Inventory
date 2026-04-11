-- D'Aisle Inventory Management System
-- Migration: Add inventory tables to existing D'Aisle Supabase project
-- NOTE: profiles table already exists from the attendance app.
-- We only add the 'inventory_manager' role and new inventory tables.

-- ============================================================
-- 1. Extend the role options on profiles (safe ALTER if enum)
-- Since the attendance app uses text role, we just document the new value.
-- The app checks: 'admin' | 'inventory_manager' | 'viewer'
-- No schema change needed — profiles.role is already TEXT.
-- ============================================================

-- ============================================================
-- 2. Helper functions (create if not exist)
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = (SELECT auth.uid())
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT (SELECT public.get_user_role()) = 'admin'
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_manager_or_admin()
RETURNS BOOLEAN AS $$
  SELECT (SELECT public.get_user_role()) IN ('admin', 'inventory_manager')
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_active_user()
RETURNS BOOLEAN AS $$
  SELECT is_active FROM public.profiles WHERE id = (SELECT auth.uid())
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- 3. Categories
-- ============================================================

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#C82A5F',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY categories_select ON public.categories FOR SELECT USING ((SELECT public.is_active_user()));
CREATE POLICY categories_insert ON public.categories FOR INSERT WITH CHECK ((SELECT public.is_manager_or_admin()));
CREATE POLICY categories_update ON public.categories FOR UPDATE USING ((SELECT public.is_manager_or_admin()));
CREATE POLICY categories_delete ON public.categories FOR DELETE USING ((SELECT public.is_admin()));

-- ============================================================
-- 4. Suppliers
-- ============================================================

CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY suppliers_select ON public.suppliers FOR SELECT USING ((SELECT public.is_active_user()));
CREATE POLICY suppliers_insert ON public.suppliers FOR INSERT WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY suppliers_update ON public.suppliers FOR UPDATE USING ((SELECT public.is_admin()));

-- ============================================================
-- 5. Products
-- ============================================================

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_code TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES public.categories(id),
  sub_type TEXT,
  image_url TEXT,
  low_stock_threshold DECIMAL NOT NULL DEFAULT 10,
  is_phased_out BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY products_select ON public.products FOR SELECT USING ((SELECT public.is_active_user()));
CREATE POLICY products_insert ON public.products FOR INSERT WITH CHECK ((SELECT public.is_manager_or_admin()));
CREATE POLICY products_update ON public.products FOR UPDATE USING ((SELECT public.is_manager_or_admin()));

-- ============================================================
-- 6. Shipments
-- ============================================================

CREATE TABLE IF NOT EXISTS public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_number TEXT NOT NULL UNIQUE,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'cancelled')),
  expected_date DATE,
  received_date DATE,
  received_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY shipments_select ON public.shipments FOR SELECT USING ((SELECT public.is_active_user()));
CREATE POLICY shipments_insert ON public.shipments FOR INSERT WITH CHECK ((SELECT public.is_manager_or_admin()));
CREATE POLICY shipments_update ON public.shipments FOR UPDATE USING ((SELECT public.is_manager_or_admin()));

-- ============================================================
-- 7. Shipment Items
-- ============================================================

CREATE TABLE IF NOT EXISTS public.shipment_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity DECIMAL NOT NULL,
  input_unit TEXT NOT NULL DEFAULT 'meters' CHECK (input_unit IN ('meters', 'yards')),
  quantity_in_meters DECIMAL NOT NULL,
  num_rolls INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shipment_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY shipment_items_select ON public.shipment_items FOR SELECT USING ((SELECT public.is_active_user()));
CREATE POLICY shipment_items_insert ON public.shipment_items FOR INSERT WITH CHECK ((SELECT public.is_manager_or_admin()));
CREATE POLICY shipment_items_update ON public.shipment_items FOR UPDATE USING ((SELECT public.is_manager_or_admin()));
CREATE POLICY shipment_items_delete ON public.shipment_items FOR DELETE USING ((SELECT public.is_manager_or_admin()));

-- ============================================================
-- 8. Rolls
-- ============================================================

CREATE TABLE IF NOT EXISTS public.rolls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id),
  roll_number TEXT NOT NULL UNIQUE,
  initial_length_m DECIMAL NOT NULL,
  current_length_m DECIMAL NOT NULL,
  is_full_roll BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'finished')),
  shipment_id UUID REFERENCES public.shipments(id),
  received_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rolls ENABLE ROW LEVEL SECURITY;

CREATE POLICY rolls_select ON public.rolls FOR SELECT USING ((SELECT public.is_active_user()));
CREATE POLICY rolls_insert ON public.rolls FOR INSERT WITH CHECK ((SELECT public.is_manager_or_admin()));
CREATE POLICY rolls_update ON public.rolls FOR UPDATE USING ((SELECT public.is_manager_or_admin()));

-- ============================================================
-- 9. Brides
-- ============================================================

CREATE TABLE IF NOT EXISTS public.brides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  wedding_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.brides ENABLE ROW LEVEL SECURITY;

CREATE POLICY brides_select ON public.brides FOR SELECT USING ((SELECT public.is_active_user()));
CREATE POLICY brides_insert ON public.brides FOR INSERT WITH CHECK ((SELECT public.is_manager_or_admin()));
CREATE POLICY brides_update ON public.brides FOR UPDATE USING ((SELECT public.is_manager_or_admin()));

-- ============================================================
-- 10. Stock Usage (immutable)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.stock_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bride_id UUID NOT NULL REFERENCES public.brides(id),
  roll_id UUID NOT NULL REFERENCES public.rolls(id),
  quantity_used DECIMAL NOT NULL CHECK (quantity_used > 0),
  logged_by UUID NOT NULL REFERENCES public.profiles(id),
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.stock_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY stock_usage_select ON public.stock_usage FOR SELECT USING ((SELECT public.is_active_user()));
CREATE POLICY stock_usage_insert ON public.stock_usage FOR INSERT WITH CHECK ((SELECT public.is_manager_or_admin()));
-- No UPDATE or DELETE policies — immutable

-- ============================================================
-- 11. Stock Adjustments (immutable)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.stock_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roll_id UUID NOT NULL REFERENCES public.rolls(id),
  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('addition', 'deduction', 'damage', 'correction')),
  quantity DECIMAL NOT NULL,
  reason TEXT NOT NULL,
  adjusted_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.stock_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY adjustments_select ON public.stock_adjustments FOR SELECT USING ((SELECT public.is_active_user()));
CREATE POLICY adjustments_insert ON public.stock_adjustments FOR INSERT WITH CHECK ((SELECT public.is_manager_or_admin()));
-- No UPDATE or DELETE policies — immutable

-- ============================================================
-- 12. Activity Log (immutable, admin-read-only)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.inventory_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.inventory_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY activity_log_select_admin ON public.inventory_activity_log FOR SELECT USING ((SELECT public.is_admin()));
CREATE POLICY activity_log_insert ON public.inventory_activity_log FOR INSERT WITH CHECK ((SELECT public.is_active_user()));
-- No UPDATE or DELETE policies — immutable

-- ============================================================
-- 13. Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_item_code ON public.products(item_code);
CREATE INDEX IF NOT EXISTS idx_rolls_product ON public.rolls(product_id);
CREATE INDEX IF NOT EXISTS idx_rolls_status ON public.rolls(status);
CREATE INDEX IF NOT EXISTS idx_stock_usage_bride ON public.stock_usage(bride_id);
CREATE INDEX IF NOT EXISTS idx_stock_usage_roll ON public.stock_usage(roll_id);
CREATE INDEX IF NOT EXISTS idx_stock_usage_date ON public.stock_usage(usage_date);
CREATE INDEX IF NOT EXISTS idx_inv_activity_log_action ON public.inventory_activity_log(action_type);
CREATE INDEX IF NOT EXISTS idx_inv_activity_log_entity ON public.inventory_activity_log(entity_type);
CREATE INDEX IF NOT EXISTS idx_inv_activity_log_user ON public.inventory_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_inv_activity_log_created ON public.inventory_activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_shipments_supplier ON public.shipments(supplier_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON public.shipments(status);

-- ============================================================
-- 14. Product stock summary view
-- ============================================================

CREATE OR REPLACE VIEW public.product_stock_summary AS
SELECT
  p.id,
  p.item_code,
  p.description,
  p.category_id,
  p.sub_type,
  p.image_url,
  p.low_stock_threshold,
  p.is_phased_out,
  COALESCE(SUM(r.current_length_m) FILTER (WHERE r.status = 'active'), 0) AS total_stock_m,
  COUNT(r.id) FILTER (WHERE r.status = 'active') AS active_roll_count,
  CASE
    WHEN p.is_phased_out THEN 'phased_out'
    WHEN COALESCE(SUM(r.current_length_m) FILTER (WHERE r.status = 'active'), 0) = 0 THEN 'out_of_stock'
    WHEN COALESCE(SUM(r.current_length_m) FILTER (WHERE r.status = 'active'), 0) <= p.low_stock_threshold THEN 'low_stock'
    ELSE 'in_stock'
  END AS stock_status
FROM public.products p
LEFT JOIN public.rolls r ON r.product_id = p.id
GROUP BY p.id, p.item_code, p.description, p.category_id, p.sub_type, p.image_url, p.low_stock_threshold, p.is_phased_out;

-- ============================================================
-- 15. Auto-generate roll number function
-- ============================================================

CREATE OR REPLACE FUNCTION public.generate_roll_number(p_product_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_item_code TEXT;
  v_max_num INTEGER;
BEGIN
  SELECT item_code INTO v_item_code FROM public.products WHERE id = p_product_id;

  SELECT COALESCE(MAX(
    CAST(SUBSTRING(roll_number FROM LENGTH(v_item_code) + 3) AS INTEGER)
  ), 0) INTO v_max_num
  FROM public.rolls
  WHERE product_id = p_product_id;

  RETURN v_item_code || '-R' || (v_max_num + 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 16. Auto-generate shipment number function
-- ============================================================

CREATE OR REPLACE FUNCTION public.generate_shipment_number()
RETURNS TEXT AS $$
DECLARE
  v_year TEXT;
  v_max_num INTEGER;
BEGIN
  v_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;

  SELECT COALESCE(MAX(
    CAST(SUBSTRING(shipment_number FROM 9) AS INTEGER)
  ), 0) INTO v_max_num
  FROM public.shipments
  WHERE shipment_number LIKE 'SH-' || v_year || '-%';

  RETURN 'SH-' || v_year || '-' || LPAD((v_max_num + 1)::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
