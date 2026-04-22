"use server";

import { createClient } from "@/lib/supabase/server";
import { categorySchema, type CategoryFormData } from "@/validators/category";
import { revalidatePath } from "next/cache";

export async function createCategory(data: CategoryFormData) {
  const parsed = categorySchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert(parsed.data);

  if (error) {
    if (error.code === "23505") return { error: { name: ["Category name already exists"] } };
    return { error: { name: [error.message] } };
  }

  revalidatePath("/categories");
  return { success: true };
}

export async function updateCategory(id: string, data: CategoryFormData) {
  const parsed = categorySchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.from("categories").update(parsed.data).eq("id", id);

  if (error) {
    if (error.code === "23505") return { error: { name: ["Category name already exists"] } };
    return { error: { name: [error.message] } };
  }

  revalidatePath("/categories");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();

  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("category_id", id);

  if (count && count > 0) {
    return { error: `Cannot delete: ${count} product(s) use this category` };
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/categories");
  return { success: true };
}
