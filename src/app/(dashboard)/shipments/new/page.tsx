import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { ShipmentForm } from "@/components/shipments/shipment-form";

export default async function NewShipmentPage() {
  const supabase = await createClient();

  const [{ data: suppliers }, { data: products }] = await Promise.all([
    supabase.from("suppliers").select("id, name").eq("is_active", true).order("name"),
    supabase.from("products").select("id, item_code, description, stock_unit").eq("is_phased_out", false).order("item_code"),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="New Shipment" description="Record incoming stock from a supplier" />
      <ShipmentForm suppliers={suppliers ?? []} products={products ?? []} />
    </div>
  );
}
