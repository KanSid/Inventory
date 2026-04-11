"use server";

import { createClient } from "@/lib/supabase/server";
import { adjustmentSchema, type AdjustmentFormData } from "@/validators/adjustment";
import { revalidatePath } from "next/cache";

export async function createAdjustment(data: AdjustmentFormData) {
  const parsed = adjustmentSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: { roll_id: ["Not authenticated"] } };

  // Get current roll
  const { data: roll } = await supabase
    .from("rolls")
    .select("current_length_m, status, product_id")
    .eq("id", parsed.data.roll_id)
    .single();

  if (!roll) return { error: { roll_id: ["Roll not found"] } };

  // Calculate new length
  let newLength = roll.current_length_m;
  if (parsed.data.adjustment_type === "addition" || parsed.data.adjustment_type === "correction") {
    newLength += parsed.data.quantity;
  } else {
    newLength -= parsed.data.quantity;
    if (newLength < 0) {
      return { error: { quantity: [`Cannot deduct ${parsed.data.quantity}m from ${roll.current_length_m}m remaining`] } };
    }
  }

  // Insert adjustment
  const { error: adjError } = await supabase
    .from("stock_adjustments")
    .insert({
      roll_id: parsed.data.roll_id,
      adjustment_type: parsed.data.adjustment_type,
      quantity: parsed.data.quantity,
      reason: parsed.data.reason,
      adjusted_by: user.id,
    });

  if (adjError) return { error: { roll_id: [adjError.message] } };

  // Update roll
  const updates: Record<string, unknown> = {
    current_length_m: newLength,
    updated_at: new Date().toISOString(),
  };
  if (newLength <= 0) {
    updates.status = "finished";
    updates.current_length_m = 0;
  } else if (roll.status === "finished" && newLength > 0) {
    updates.status = "active";
  }

  await supabase.from("rolls").update(updates).eq("id", parsed.data.roll_id);

  // Log activity
  await supabase.from("inventory_activity_log").insert({
    user_id: user.id,
    action_type: "adjustment_made",
    entity_type: "adjustment",
    details: {
      roll_id: parsed.data.roll_id,
      type: parsed.data.adjustment_type,
      quantity: parsed.data.quantity,
      reason: parsed.data.reason,
      new_length: newLength,
    },
  });

  revalidatePath("/adjustments");
  revalidatePath("/products");
  revalidatePath("/dashboard");
  return { success: true };
}
