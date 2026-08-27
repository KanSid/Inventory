"use server";

import { createClient } from "@/lib/supabase/server";
import { supplierSchema, type SupplierFormData } from "@/validators/supplier";
import { revalidatePath } from "next/cache";
import { getPostHogClient } from "@/lib/posthog-server";

export async function createSupplier(data: SupplierFormData) {
  const parsed = supplierSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: supplier, error } = await supabase
    .from("suppliers")
    .insert({
      ...parsed.data,
      contact_person: parsed.data.contact_person || null,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
      notes: parsed.data.notes || null,
    })
    .select("id")
    .single();

  if (error) return { error: { name: [error.message] } };

  const { data: { user } } = await supabase.auth.getUser();
  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: user?.id ?? "anonymous",
    event: "supplier_created",
    properties: {
      supplier_id: supplier.id,
      has_contact_person: !!parsed.data.contact_person,
    },
  });
  await posthog.flush();

  revalidatePath("/suppliers");
  return { success: true, id: supplier.id };
}

export async function updateSupplier(id: string, data: SupplierFormData) {
  const parsed = supplierSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase
    .from("suppliers")
    .update({
      ...parsed.data,
      contact_person: parsed.data.contact_person || null,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
      notes: parsed.data.notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: { name: [error.message] } };

  revalidatePath("/suppliers");
  return { success: true };
}

export async function toggleSupplierActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("suppliers")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/suppliers");
  return { success: true };
}
