"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/auth";

const ROLE_HIERARCHY: Record<string, number> = {
  viewer: 0,
  inventory_manager: 1,
  admin: 2,
};

export async function changeUserRole(userId: string, newRole: string) {
  const admin = await getAdminUser();
  if (!admin) return { error: "Insufficient permissions" };
  const { supabase, user } = admin;

  if (!["viewer", "inventory_manager", "admin"].includes(newRole)) {
    return { error: "Invalid role" };
  }

  // Fetch target user's current role for hierarchy check
  const { data: target } = await supabase.from("profiles").select("role").eq("id", userId).single();
  if (!target) return { error: "User not found" };

  // Admin can only assign roles at or below their own level (admin = full access)
  if (ROLE_HIERARCHY[newRole] > ROLE_HIERARCHY["admin"]) {
    return { error: "Cannot assign a role higher than your own" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      role: newRole,
      role_changed_at: new Date().toISOString(),
      role_changed_by: user.id,
    })
    .eq("id", userId);

  if (error) return { error: error.message };

  await supabase.from("inventory_activity_log").insert({
    user_id: user.id,
    action_type: "user_role_changed",
    entity_type: "profile",
    entity_id: userId,
    details: { previous_role: target.role, new_role: newRole },
  });

  revalidatePath("/settings/users");
  return { success: true };
}

export async function toggleUserActive(userId: string, activate: boolean) {
  const admin = await getAdminUser();
  if (!admin) return { error: "Insufficient permissions" };
  const { supabase, user } = admin;

  const updateData: Record<string, unknown> = { is_active: activate };
  if (!activate) {
    updateData.deactivated_at = new Date().toISOString();
    updateData.deactivated_by = user.id;
  }

  const { error } = await supabase.from("profiles").update(updateData).eq("id", userId);
  if (error) return { error: error.message };

  await supabase.from("inventory_activity_log").insert({
    user_id: user.id,
    action_type: activate ? "user_reactivated" : "user_deactivated",
    entity_type: "profile",
    entity_id: userId,
    details: {},
  });

  revalidatePath("/settings/users");
  return { success: true };
}

export async function initiatePasswordReset(userId: string) {
  const admin = await getAdminUser();
  if (!admin) return { error: "Insufficient permissions" };
  const { supabase, user } = admin;

  // Use admin client to get the target user's email
  const adminClient = await createAdminClient();
  const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(userId);
  if (authError || !authUser.user?.email) return { error: "Could not retrieve user email" };

  // Send password reset email via admin client
  const { error } = await adminClient.auth.admin.generateLink({
    type: "recovery",
    email: authUser.user.email,
  });

  if (error) return { error: error.message };

  await supabase.from("inventory_activity_log").insert({
    user_id: user.id,
    action_type: "user_password_reset",
    entity_type: "profile",
    entity_id: userId,
    details: { initiated_by: "admin" },
  });

  revalidatePath("/settings/users");
  return { success: true };
}
