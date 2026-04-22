import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { ShipmentForm } from "@/components/shipments/shipment-form";

export default async function NewShipmentPage() {
  const supabase = await createClient();

  const [{ data: suppliers }, { data: rawProducts }] = await Promise.all([
    supabase.from("suppliers").select("id, name").eq("is_active", true).order("name"),
    supabase.from("products").select("id, item_code, description, categories(unit)").eq("is_phased_out", false).order("item_code"),
  ]);

  const products = (rawProducts ?? []).map((p) => ({
    id: p.id,
    item_code: p.item_code,
    description: p.description,
    category_unit: ((p.categories as unknown as { unit: string } | null)?.unit ?? "roll"),
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="New Shipment" description="Record incoming stock from a supplier" />
      <ShipmentForm suppliers={suppliers ?? []} products={products} />
    </div>
  );
}
