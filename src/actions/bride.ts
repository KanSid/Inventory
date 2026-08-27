"use server";

import { createClient } from "@/lib/supabase/server";
import { brideSchema, type BrideFormData } from "@/validators/bride";
import { revalidatePath } from "next/cache";
import { getPostHogClient } from "@/lib/posthog-server";

export async function createBride(data: BrideFormData) {
  const parsed = brideSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: bride, error } = await supabase
    .from("brides")
    .insert({
      ...parsed.data,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      wedding_date: parsed.data.wedding_date || null,
      notes: parsed.data.notes || null,
    })
    .select("id, name")
    .single();

  if (error) return { error: { name: [error.message] } };

  const { data: { user } } = await supabase.auth.getUser();
  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: user?.id ?? "anonymous",
    event: "bride_created",
    properties: {
      bride_id: bride.id,
      has_wedding_date: !!parsed.data.wedding_date,
    },
  });
  await posthog.flush();

  revalidatePath("/brides");
  return { success: true, bride };
}

export async function updateBride(id: string, data: BrideFormData) {
  const parsed = brideSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase
    .from("brides")
    .update({
      ...parsed.data,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      wedding_date: parsed.data.wedding_date || null,
      notes: parsed.data.notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: { name: [error.message] } };

  revalidatePath("/brides");
  return { success: true };
}
