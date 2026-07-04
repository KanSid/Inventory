CREATE POLICY "shipments_delete" ON public.shipments
  FOR DELETE TO public
  USING (is_manager_or_admin());
