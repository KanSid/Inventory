"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveAdminSettings(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { error: "Insufficient permissions" };

  const low_stock_threshold = parseFloat(formData.get("low_stock_threshold") as string);
  const reorder_point = parseFloat(formData.get("reorder_point") as string);
  const default_user_role = formData.get("default_user_role") as string;
  const report_auto_export_enabled = formData.get("report_auto_export_enabled") === "on";
  const report_auto_export_schedule = formData.get("report_auto_export_schedule") as string;
  const notify_low_stock = formData.get("notify_low_stock") === "on";
  const notify_new_shipment = formData.get("notify_new_shipment") === "on";
  const notify_report_ready = formData.get("notify_report_ready") === "on";
  const data_retention_days = parseInt(formData.get("data_retention_days") as string, 10);

  if (isNaN(low_stock_threshold) || low_stock_threshold < 0) return { error: "Invalid low stock threshold" };
  if (isNaN(reorder_point) || reorder_point < 0) return { error: "Invalid reorder point" };
  if (!["viewer", "inventory_manager", "admin"].includes(default_user_role)) return { error: "Invalid role" };
  if (isNaN(data_retention_days) || data_retention_days < 30) return { error: "Retention must be at least 30 days" };

  const { error } = await supabase
    .from("admin_config")
    .update({
      low_stock_threshold,
      reorder_point,
      default_user_role,
      report_auto_export_enabled,
      report_auto_export_schedule,
      notify_low_stock,
      notify_new_shipment,
      notify_report_ready,
      data_retention_days,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq("id", 1);

  if (error) return { error: error.message };

  // Log the config change
  await supabase.from("inventory_activity_log").insert({
    user_id: user.id,
    action_type: "config_updated",
    entity_type: "admin_config",
    entity_id: null,
    details: {
      low_stock_threshold,
      reorder_point,
      default_user_role,
      report_auto_export_enabled,
      data_retention_days,
    },
  });

  revalidatePath("/settings/admin");
  return { success: true };
}
