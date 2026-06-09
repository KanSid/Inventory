import { createClient } from "@/lib/supabase/server";
import { ProductsClient } from "@/components/products/products-client";

export default async function ProductsPage() {
  const supabase = await createClient();

  const [
    { data: products },
    { data: categories },
    { data: productTypes },
    { data: costingCategories },
    { data: designFamilies },
    { data: { user } },
  ] = await Promise.all([
    supabase.from("product_stock_summary").select("*").order("item_code"),
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("product_types").select("id, name").order("name"),
    supabase.from("costing_categories").select("id, name").order("name"),
    supabase.from("design_families").select("id, name").order("name"),
    supabase.auth.getUser(),
  ]);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  const canEdit = profile?.role === "admin" || profile?.role === "inventory_manager";

  return (
    <ProductsClient
      products={products ?? []}
      categories={categories ?? []}
      productTypes={productTypes ?? []}
      costingCategories={costingCategories ?? []}
      designFamilies={designFamilies ?? []}
      canEdit={canEdit}
    />
  );
}
