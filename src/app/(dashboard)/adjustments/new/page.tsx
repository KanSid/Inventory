import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { AdjustmentForm } from "@/components/adjustments/adjustment-form";

export default async function NewAdjustmentPage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("id, item_code, description")
    .eq("is_phased_out", false)
    .order("item_code");

  return (
    <div className="space-y-6">
      <PageHeader title="New Adjustment" description="Record a stock correction or damage" />
      <AdjustmentForm products={products ?? []} />
    </div>
  );
}
