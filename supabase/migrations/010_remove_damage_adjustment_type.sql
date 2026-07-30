ALTER TABLE stock_adjustments DROP CONSTRAINT stock_adjustments_adjustment_type_check;
ALTER TABLE stock_adjustments ADD CONSTRAINT stock_adjustments_adjustment_type_check CHECK (adjustment_type IN ('addition', 'deduction', 'correction'));
