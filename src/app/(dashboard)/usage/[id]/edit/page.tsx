import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { EditUsageForm } from "@/components/usage/edit-usage-form";
import { formatDate } from "@/lib/utils";

export default async function EditUsagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  if (profile?.role !== "admin" && profile?.role !== "inventory_manager") redirect("/usage");

  const { data: u } = await supabase
    .from("stock_usage")
    .select("*, brides(name), rolls(roll_number, current_length_m, products(item_code, categories(unit))), piece_batches(batch_number, current_count, products(item_code, categories(unit)))")
    .eq("id", id)
    .single();

  if (!u) notFound();

  const { data: brides } = await supabase.from("brides").select("id, name").order("name");

  const roll = u.rolls as any;
  const batch = u.piece_batches as any;
  const bride = u.brides as any;
  const isRoll = !!roll;

  const stockUnit = (isRoll
    ? roll?.products?.categories?.unit
    : batch?.products?.categories?.unit) ?? "roll";

  const oldQty = Number(u.quantity_used);
  const currentStock = isRoll ? Number(roll?.current_length_m ?? 0) : (batch?.current_count ?? 0);
  const available = currentStock + oldQty;

  const entryCode = isRoll ? roll?.products?.item_code : batch?.products?.item_code;
  const entryNum = isRoll ? roll?.roll_number : batch?.batch_number;
  const entryLabel = `${entryCode} — ${entryNum}`;

  const initial = {
    bride_id: u.bride_id,
    usage_date: u.usage_date,
    quantity_used: oldQty,
    notes: u.notes ?? "",
    entryLabel,
    stockUnit: stockUnit as "roll" | "pieces",
    available,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Usage"
        description={`${bride?.name ?? "Unknown"} · ${formatDate(u.usage_date)}`}
      />
      <EditUsageForm usageId={id} brides={brides ?? []} initial={initial} />
    </div>
  );
}
