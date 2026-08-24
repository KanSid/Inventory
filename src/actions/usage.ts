"use server";

import { createClient } from "@/lib/supabase/server";
import { usageSchema, type UsageFormData } from "@/validators/usage";
import { revalidatePath } from "next/cache";

export async function logUsage(data: UsageFormData) {
  const parsed = usageSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: { bride_id: ["Not authenticated"] } };

  const { bride_id, roll_id, batch_id, quantity_used, usage_date, notes } = parsed.data;

  // Fetch bride name
  const { data: bride } = await supabase.from("brides").select("name").eq("id", bride_id).single();

  if (roll_id) {
    const { data: roll } = await supabase
      .from("rolls")
      .select("current_length_m, status, roll_number, product_id, products(item_code)")
      .eq("id", roll_id)
      .single();

    if (!roll) return { error: { roll_id: ["Roll not found"] } };
    if (roll.status === "finished") return { error: { roll_id: ["Roll is already finished"] } };
    if (quantity_used > roll.current_length_m) {
      return { error: { quantity_used: [`Exceeds remaining stock (${roll.current_length_m}m)`] } };
    }

    const { error: usageError } = await supabase.from("stock_usage").insert({
      bride_id, roll_id, batch_id: null, quantity_used, logged_by: user.id, usage_date, notes: notes || null,
    });
    if (usageError) return { error: { bride_id: [usageError.message] } };

    const newLength = Math.max(0, roll.current_length_m - quantity_used);
    await supabase.from("rolls").update({
      current_length_m: newLength,
      is_full_roll: false,
      status: newLength <= 0 ? "finished" : "active",
      updated_at: new Date().toISOString(),
    }).eq("id", roll_id);

    const rollData = roll as any;
    await supabase.from("inventory_activity_log").insert({
      user_id: user.id, action_type: "stock_used", entity_type: "usage",
      details: {
        bride: bride?.name ?? "Unknown",
        product: rollData?.products?.item_code ?? "Unknown",
        roll: rollData?.roll_number ?? "Unknown",
        quantity_used, remaining: newLength,
      },
    });
  } else {
    const { data: batch } = await supabase
      .from("piece_batches")
      .select("current_count, status, batch_number, product_id, products(item_code)")
      .eq("id", batch_id!)
      .single();

    if (!batch) return { error: { roll_id: ["Batch not found"] } };
    if (batch.status === "finished") return { error: { roll_id: ["Batch is already finished"] } };
    const qtyInt = Math.round(quantity_used);
    if (qtyInt > batch.current_count) {
      return { error: { quantity_used: [`Exceeds remaining stock (${batch.current_count} pcs)`] } };
    }

    const { error: usageError } = await supabase.from("stock_usage").insert({
      bride_id, roll_id: null, batch_id: batch_id!, quantity_used: qtyInt, logged_by: user.id, usage_date, notes: notes || null,
    });
    if (usageError) return { error: { bride_id: [usageError.message] } };

    const newCount = batch.current_count - qtyInt;
    await supabase.from("piece_batches").update({
      current_count: newCount,
      status: newCount <= 0 ? "finished" : "active",
      updated_at: new Date().toISOString(),
    }).eq("id", batch_id!);

    const batchData = batch as any;
    await supabase.from("inventory_activity_log").insert({
      user_id: user.id, action_type: "stock_used", entity_type: "usage",
      details: {
        bride: bride?.name ?? "Unknown",
        product: batchData?.products?.item_code ?? "Unknown",
        batch: batchData?.batch_number ?? "Unknown",
        quantity_used: qtyInt, remaining: newCount,
      },
    });
  }

  revalidatePath("/usage");
  revalidatePath("/products");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getProductUsagePage(params: {
  productId: string;
  isRoll: boolean;
  offset: number;
  limit: number;
  dateFrom?: string | null;
  dateTo?: string | null;
}) {
  const { productId, isRoll, offset, limit, dateFrom, dateTo } = params;
  const supabase = await createClient();
  const idField = isRoll ? "roll_id" : "batch_id";

  let ids: string[];
  if (isRoll) {
    const { data: rolls } = await supabase.from("rolls").select("id").eq("product_id", productId);
    ids = (rolls ?? []).map((r) => r.id);
  } else {
    const { data: batches } = await supabase.from("piece_batches").select("id").eq("product_id", productId);
    ids = (batches ?? []).map((b) => b.id);
  }
  if (ids.length === 0) return { data: [], count: 0 };

  let pageQuery = supabase
    .from("stock_usage")
    .select(isRoll ? "*, brides(name), rolls(roll_number)" : "*, brides(name), piece_batches(batch_number)", { count: "exact" })
    .in(idField, ids)
    .order("usage_date", { ascending: false });
  if (dateFrom) pageQuery = pageQuery.gte("usage_date", dateFrom);
  if (dateTo) pageQuery = pageQuery.lte("usage_date", dateTo);
  pageQuery = pageQuery.range(offset, offset + limit - 1);

  const { data, count } = await pageQuery;

  return { data: data ?? [], count: count ?? 0 };
}

export async function updateUsage(
  usageId: string,
  data: { bride_id: string; usage_date: string; quantity_used: number; notes: string | null },
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin" && profile?.role !== "inventory_manager") {
    return { error: "Unauthorized" };
  }

  const { data: existing } = await supabase
    .from("stock_usage")
    .select("bride_id, roll_id, batch_id, quantity_used, usage_date, notes")
    .eq("id", usageId)
    .single();
  if (!existing) return { error: "Usage record not found" };

  const oldQty = Number(existing.quantity_used);
  const newQty = data.quantity_used;
  const delta = newQty - oldQty;

  if (existing.roll_id) {
    const { data: roll } = await supabase
      .from("rolls")
      .select("current_length_m, roll_number, product_id, products(item_code)")
      .eq("id", existing.roll_id)
      .single();
    if (!roll) return { error: "Roll not found" };

    const available = Number(roll.current_length_m) + oldQty;
    if (newQty > available) {
      return { error: `Exceeds available stock (${available}m after reversing original)` };
    }

    const newLength = Math.max(0, Number(roll.current_length_m) - delta);
    await supabase.from("rolls").update({
      current_length_m: newLength,
      status: newLength <= 0 ? "finished" : "active",
      updated_at: new Date().toISOString(),
    }).eq("id", existing.roll_id);
  } else if (existing.batch_id) {
    const { data: batch } = await supabase
      .from("piece_batches")
      .select("current_count, batch_number, product_id, products(item_code)")
      .eq("id", existing.batch_id)
      .single();
    if (!batch) return { error: "Batch not found" };

    const available = batch.current_count + Math.round(oldQty);
    const newQtyInt = Math.round(newQty);
    if (newQtyInt > available) {
      return { error: `Exceeds available stock (${available} pcs after reversing original)` };
    }

    const newCount = batch.current_count - Math.round(delta);
    await supabase.from("piece_batches").update({
      current_count: Math.max(0, newCount),
      status: newCount <= 0 ? "finished" : "active",
      updated_at: new Date().toISOString(),
    }).eq("id", existing.batch_id);
  }

  await supabase.from("stock_usage").update({
    bride_id: data.bride_id,
    usage_date: data.usage_date,
    quantity_used: existing.roll_id ? newQty : Math.round(newQty),
    notes: data.notes || null,
  }).eq("id", usageId);

  revalidatePath("/usage");
  revalidatePath("/products");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function logUsageBatch(params: {
  bride_id: string;
  usage_date: string;
  notes: string | null;
  items: Array<{ roll_id: string | null; batch_id: string | null; quantity_used: number }>;
}) {
  const { bride_id, usage_date, notes, items } = params;
  if (!items.length) return { error: { form: ["Add at least one item"] } };

  for (let i = 0; i < items.length; i++) {
    const result = await logUsage({
      bride_id,
      roll_id: items[i].roll_id,
      batch_id: items[i].batch_id,
      quantity_used: items[i].quantity_used,
      usage_date,
      notes,
    });
    if ("error" in result) return { error: result.error, failedIndex: i };
  }

  return { success: true };
}
