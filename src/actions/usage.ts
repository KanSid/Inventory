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

  // Validate quantity against roll remaining
  const { data: roll } = await supabase
    .from("rolls")
    .select("current_length_m, status")
    .eq("id", parsed.data.roll_id)
    .single();

  if (!roll) return { error: { roll_id: ["Roll not found"] } };
  if (roll.status === "finished") return { error: { roll_id: ["Roll is already finished"] } };
  if (parsed.data.quantity_used > roll.current_length_m) {
    return { error: { quantity_used: [`Exceeds remaining stock (${roll.current_length_m}m)`] } };
  }

  // Insert usage
  const { error: usageError } = await supabase
    .from("stock_usage")
    .insert({
      bride_id: parsed.data.bride_id,
      roll_id: parsed.data.roll_id,
      quantity_used: parsed.data.quantity_used,
      logged_by: user.id,
      usage_date: parsed.data.usage_date,
      notes: parsed.data.notes || null,
    });

  if (usageError) return { error: { bride_id: [usageError.message] } };

  // Deduct from roll
  const newLength = roll.current_length_m - parsed.data.quantity_used;
  const updates: Record<string, unknown> = {
    current_length_m: newLength,
    is_full_roll: false,
    updated_at: new Date().toISOString(),
  };
  if (newLength <= 0) {
    updates.status = "finished";
    updates.current_length_m = 0;
  }

  await supabase.from("rolls").update(updates).eq("id", parsed.data.roll_id);

  // Log activity
  await supabase.from("inventory_activity_log").insert({
    user_id: user.id,
    action_type: "stock_used",
    entity_type: "usage",
    details: {
      bride_id: parsed.data.bride_id,
      roll_id: parsed.data.roll_id,
      quantity_used: parsed.data.quantity_used,
      remaining: newLength,
    },
  });

  revalidatePath("/usage");
  revalidatePath("/products");
  revalidatePath("/dashboard");
  return { success: true };
}
