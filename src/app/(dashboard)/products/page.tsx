import { createClient } from "@/lib/supabase/server";
import { ProductsClient } from "@/components/products/products-client";

export default async function ProductsPage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("product_stock_summary")
    .select("*")
    .order("item_code");

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  const { data: { user } } = await supabase.auth.getUser();
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
      canEdit={canEdit}
    />
  );
}
