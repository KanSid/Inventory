import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { ShipmentForm } from "@/components/shipments/shipment-form";

export default async function EditShipmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: shipment } = await supabase
    .from("shipments")
    .select("*")
    .eq("id", id)
    .single();

  if (!shipment) notFound();
  // Only pending shipments can be edited (received ones already produced stock)
  if (shipment.status !== "pending") redirect(`/shipments/${id}`);

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  const canEdit = profile?.role === "admin" || profile?.role === "inventory_manager";
  if (!canEdit) redirect(`/shipments/${id}`);

  const [{ data: suppliers }, { data: rawProducts }, { data: items }] = await Promise.all([
    supabase.from("suppliers").select("id, name").eq("is_active", true).order("name"),
    supabase.from("products").select("id, item_code, description, categories(unit)").eq("is_phased_out", false).order("item_code"),
    supabase.from("shipment_items").select("*").eq("shipment_id", id),
  ]);

  const products = (rawProducts ?? []).map((p) => ({
    id: p.id,
    item_code: p.item_code,
    description: p.description,
    category_unit: ((p.categories as unknown as { unit: string } | null)?.unit ?? "roll"),
  }));

  const round1 = (n: number) => Math.round(n * 10) / 10;
  const fromMeters = (m: number, unit: string) => (unit === "yards" ? m / 0.9144 : m);

  const initialItems = (items ?? []).map((it) => {
    const inputUnit = (it.input_unit ?? "meters") as "meters" | "yards" | "pieces";
    const numRolls = it.num_rolls ?? 1;
    const rollLengths =
      inputUnit === "pieces"
        ? []
        : numRolls > 1 && Array.isArray(it.roll_lengths)
          ? (it.roll_lengths as number[]).map((l) => String(round1(fromMeters(l, inputUnit))))
          : Array.from({ length: numRolls }, () => "");
    return {
      supplier_id: it.supplier_id ?? "",
      product_id: it.product_id,
      quantity: it.quantity != null ? String(it.quantity) : "",
      input_unit: inputUnit,
      num_rolls: String(numRolls),
      roll_lengths: rollLengths,
      notes: it.notes ?? "",
    };
  });

  const initial = {
    shipment_number: shipment.shipment_number ?? "",
    date: shipment.date ?? "",
    notes: shipment.notes ?? "",
    items:
      initialItems.length > 0
        ? initialItems
        : [{ supplier_id: "", product_id: "", quantity: "", input_unit: "meters" as const, num_rolls: "1", roll_lengths: [""], notes: "" }],
  };

  return (
    <div className="space-y-6">
      <PageHeader title={`Edit ${shipment.shipment_number}`} description="Update this pending shipment" />
      <ShipmentForm suppliers={suppliers ?? []} products={products} mode="edit" shipmentId={id} initial={initial} />
    </div>
  );
}
