-- Add stock_unit to products: 'roll' (default) or 'pair'
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS stock_unit text NOT NULL DEFAULT 'roll'
  CHECK (stock_unit IN ('roll', 'pair'));
