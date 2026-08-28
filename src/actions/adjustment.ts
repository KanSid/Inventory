"use server";

import { createClient } from "@/lib/supabase/server";
import { adjustmentSchema, type AdjustmentFormData } from "@/validators/adjustment";
import { revalidatePath } from "next/cache";
import { getPostHogClient } from "@/lib/posthog-server";

export async function createAdjustment(data: AdjustmentFormData) {
  const parsed = adjustmentSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: { roll_id: ["Not authenticated"] } };

  const { roll_id, batch_id, adjustment_type, quantity, reason } = parsed.data;

  if (roll_id) {
    const { data: roll } = await supabase
      .from("rolls")
      .select("current_length_m, status, product_id, roll_number, products(item_code)")
      .eq("id", roll_id)
      .single();

    if (!roll) return { error: { roll_id: ["Roll not found"] } };

    let newLength = roll.current_length_m;
    if (adjustment_type === "addition") {
      newLength += quantity;
    } else {
      newLength -= quantity;
      if (newLength < 0) {
        return { error: { quantity: [`Cannot deduct ${quantity}m from ${roll.current_length_m}m remaining`] } };
      }
    }

    const { error: adjError } = await supabase.from("stock_adjustments").insert({
      roll_id, batch_id: null, adjustment_type, quantity, reason, adjusted_by: user.id,
    });
    if (adjError) return { error: { roll_id: [adjError.message] } };

    await supabase.from("rolls").update({
      current_length_m: Math.max(0, newLength),
      status: newLength <= 0 ? "finished" : "active",
      updated_at: new Date().toISOString(),
    }).eq("id", roll_id);

    const rollData = roll as any;
    await supabase.from("inventory_activity_log").insert({
      user_id: user.id, action_type: "adjustment_made", entity_type: "adjustment",
      details: {
        product: rollData?.products?.item_code ?? "Unknown",
        roll: rollData?.roll_number ?? "Unknown",
        type: adjustment_type, quantity, reason, new_length: newLength,
      },
    });
  } else {
    const { data: batch } = await supabase
      .from("piece_batches")
      .select("current_count, status, product_id, batch_number, products(item_code)")
      .eq("id", batch_id!)
      .single();

    if (!batch) return { error: { roll_id: ["Batch not found"] } };

    const qtyInt = Math.round(quantity);
    let newCount = batch.current_count;
    if (adjustment_type === "addition") {
      newCount += qtyInt;
    } else {
      newCount -= qtyInt;
      if (newCount < 0) {
        return { error: { quantity: [`Cannot deduct ${qtyInt} pcs from ${batch.current_count} pcs remaining`] } };
      }
    }

    const { error: adjError } = await supabase.from("stock_adjustments").insert({
      roll_id: null, batch_id: batch_id!, adjustment_type, quantity: qtyInt, reason, adjusted_by: user.id,
    });
    if (adjError) return { error: { roll_id: [adjError.message] } };

    await supabase.from("piece_batches").update({
      current_count: newCount,
      status: newCount <= 0 ? "finished" : "active",
      updated_at: new Date().toISOString(),
    }).eq("id", batch_id!);

    const batchData = batch as any;
    await supabase.from("inventory_activity_log").insert({
      user_id: user.id, action_type: "adjustment_made", entity_type: "adjustment",
      details: {
        product: batchData?.products?.item_code ?? "Unknown",
        batch: batchData?.batch_number ?? "Unknown",
        type: adjustment_type, quantity: qtyInt, reason, new_count: newCount,
      },
    });
  }

  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: user.id,
    event: "stock_adjustment_made",
    properties: {
      adjustment_type: parsed.data.adjustment_type,
      quantity,
      reason,
      stock_type: roll_id ? "roll" : "piece_batch",
    },
  });
  await posthog.flush();

  revalidatePath("/adjustments");
  revalidatePath("/products");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getProductAdjustmentsPage(params: {
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

  // created_at is a timestamptz; make the "to" bound inclusive of the whole day.
  const toBound = dateTo ? `${dateTo}T23:59:59.999` : null;

  let pageQuery = supabase
    .from("stock_adjustments")
    .select(isRoll ? "*, rolls(roll_number), profiles:adjusted_by(full_name)" : "*, piece_batches(batch_number), profiles:adjusted_by(full_name)", { count: "exact" })
    .in(idField, ids)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });
  if (dateFrom) pageQuery = pageQuery.gte("created_at", dateFrom);
  if (toBound) pageQuery = pageQuery.lte("created_at", toBound);
  pageQuery = pageQuery.range(offset, offset + limit - 1);

  const { data, count } = await pageQuery;

  return { data: data ?? [], count: count ?? 0 };
}
