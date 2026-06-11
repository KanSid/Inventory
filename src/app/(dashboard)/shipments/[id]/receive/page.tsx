import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { ReceiveForm } from "@/components/shipments/receive-form";

export default async function ReceiveShipmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: shipment } = await supabase
    .from("shipments")
    .select("id, shipment_number, date, status")
    .eq("id", id)
    .single();

  if (!shipment) notFound();
  if (shipment.status !== "pending") redirect(`/shipments/${id}`);

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user!.id).single();

  if (profile?.role !== "admin" && profile?.role !== "inventory_manager") {
    redirect(`/shipments/${id}`);
  }

  const { data: items } = await supabase
    .from("shipment_items")
    .select("*, products(item_code, description, categories(unit)), suppliers(name)")
    .eq("shipment_id", id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Receive shipment"
        description={`${shipment.shipment_number} — verify quantities before confirming`}
      />
      <ReceiveForm shipment={shipment} items={items ?? []} />
    </div>
  );
}
