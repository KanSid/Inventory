import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/products/product-form";
import { PageHeader } from "@/components/shared/page-header";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: product }, { data: categories }, { data: suppliers }, { data: productTypes }, { data: costingCats }, { data: designFams }] = await Promise.all([
    supabase.from("products").select("*, product_suppliers(supplier_id)").eq("id", id).single(),
    supabase.from("categories").select("*").order("name"),
    supabase.from("suppliers").select("id, name").eq("is_active", true).order("name"),
    supabase.from("product_types").select("id, name").order("sort_order"),
    supabase.from("costing_categories").select("id, name").order("sort_order"),
    supabase.from("design_families").select("id, name").order("sort_order"),
  ]);

  if (!product) notFound();

  const productWithSupplierIds = {
    ...product,
    supplier_ids: ((product.product_suppliers ?? []) as { supplier_id: string }[]).map((ps) => ps.supplier_id),
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Product" description={`${product.item_code} — ${product.description}`} />
      <ProductForm
        categories={categories ?? []}
        suppliers={suppliers ?? []}
        productTypes={productTypes ?? []}
        costingCategories={costingCats ?? []}
        designFamilies={designFams ?? []}
        product={productWithSupplierIds}
      />
    </div>
  );
}
