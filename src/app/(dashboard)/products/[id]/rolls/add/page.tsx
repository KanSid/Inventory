import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { AddRollsForm } from "@/components/products/add-rolls-form";

export default async function AddRollsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: itemCode } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("id, item_code, description, categories(unit)")
    .eq("item_code", itemCode)
    .single();

  if (!product) notFound();

  const stockUnit = ((product.categories as unknown as { unit: string } | null)?.unit ?? "roll") as "roll" | "pieces";
  if (stockUnit === "pieces") redirect(`/products/${itemCode}/pieces/add`);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Rolls"
        description={`${product.item_code} — ${product.description}`}
      />
      <AddRollsForm productId={product.id} itemCode={product.item_code} />
    </div>
  );
}
