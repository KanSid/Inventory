import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/products/product-form";
import { PageHeader } from "@/components/shared/page-header";

export default async function NewProductPage() {
  const supabase = await createClient();

  const [{ data: categories }, { data: suppliers }, { data: productTypes }, { data: costingCats }, { data: designFams }] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase.from("suppliers").select("id, name").eq("is_active", true).order("name"),
    supabase.from("product_types").select("id, name").order("sort_order"),
    supabase.from("costing_categories").select("id, name").order("sort_order"),
    supabase.from("design_families").select("id, name").order("sort_order"),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Add Product" description="Create a new material product" />
      <ProductForm
        categories={categories ?? []}
        suppliers={suppliers ?? []}
        productTypes={productTypes ?? []}
        costingCategories={costingCats ?? []}
        designFamilies={designFams ?? []}
      />
    </div>
  );
}
