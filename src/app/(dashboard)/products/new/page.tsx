import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/products/product-form";
import { PageHeader } from "@/components/shared/page-header";

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  return (
    <div className="space-y-6">
      <PageHeader title="Add Product" description="Create a new material product" />
      <ProductForm categories={categories ?? []} />
    </div>
  );
}
