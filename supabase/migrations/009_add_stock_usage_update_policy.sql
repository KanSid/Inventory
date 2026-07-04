CREATE POLICY "stock_usage_update" ON public.stock_usage
  FOR UPDATE TO public
  USING (is_manager_or_admin())
  WITH CHECK (is_manager_or_admin());
