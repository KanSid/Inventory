import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/products/product-form";
import { PageHeader } from "@/components/shared/page-header";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).single(),
    supabase.from("categories").select("*").order("name"),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Product" description={`${product.item_code} — ${product.description}`} />
      <ProductForm categories={categories ?? []} product={product} />
    </div>
  );
}
