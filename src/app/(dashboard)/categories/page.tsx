import { createClient } from "@/lib/supabase/server";
import { CategoriesClient } from "@/components/categories/categories-client";

export default async function CategoriesPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  // Get product counts per category
  const { data: products } = await supabase
    .from("products")
    .select("category_id");

  const countMap: Record<string, number> = {};
  products?.forEach((p) => {
    countMap[p.category_id] = (countMap[p.category_id] || 0) + 1;
  });

  // Get user role
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  return (
    <CategoriesClient
      categories={categories ?? []}
      productCounts={countMap}
      canEdit={profile?.role === "admin" || profile?.role === "inventory_manager"}
      canDelete={profile?.role === "admin"}
    />
  );
}
