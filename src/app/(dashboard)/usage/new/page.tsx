import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { UsageForm } from "@/components/usage/usage-form";

export default async function NewUsagePage() {
  const supabase = await createClient();

  const [{ data: brides }, { data: rawProducts }] = await Promise.all([
    supabase.from("brides").select("id, name").order("name"),
    supabase.from("products").select("id, item_code, description, categories(unit)").eq("is_phased_out", false).order("item_code"),
  ]);

  const products = (rawProducts ?? []).map((p) => ({
    id: p.id,
    item_code: p.item_code,
    description: p.description,
    categories: (p.categories as unknown as { unit: string } | null),
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Log Usage" description="Record material consumption for a bride" />
      <UsageForm brides={brides ?? []} products={products} />
    </div>
  );
}
