import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { AddPiecesForm } from "@/components/products/add-pieces-form";

export default async function AddPiecesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("id, item_code, description, categories(unit)")
    .eq("id", id)
    .single();

  if (!product) notFound();

  const stockUnit = ((product.categories as unknown as { unit: string } | null)?.unit ?? "roll") as "roll" | "pieces";
  if (stockUnit !== "pieces") redirect(`/products/${id}/rolls/add`);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Pieces"
        description={`${product.item_code} — ${product.description}`}
      />
      <AddPiecesForm productId={product.id} itemCode={product.item_code} />
    </div>
  );
}
