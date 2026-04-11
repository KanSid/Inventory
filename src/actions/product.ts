"use server";

import { createClient } from "@/lib/supabase/server";
import { productSchema, type ProductFormData, addRollsSchema, type AddRollsFormData } from "@/validators/product";
import { revalidatePath } from "next/cache";

export async function createProduct(data: ProductFormData) {
  const parsed = productSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: product, error } = await supabase
    .from("products")
    .insert({
      item_code: parsed.data.item_code,
      description: parsed.data.description,
      category_id: parsed.data.category_id,
      sub_type: parsed.data.sub_type || null,
      image_url: parsed.data.image_url || null,
      low_stock_threshold: parsed.data.low_stock_threshold,
      notes: parsed.data.notes || null,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return { error: { item_code: ["Item code already exists"] } };
    return { error: { item_code: [error.message] } };
  }

  revalidatePath("/products");
  return { success: true, id: product.id };
}

export async function updateProduct(id: string, data: ProductFormData) {
  const parsed = productSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({
      item_code: parsed.data.item_code,
      description: parsed.data.description,
      category_id: parsed.data.category_id,
      sub_type: parsed.data.sub_type || null,
      image_url: parsed.data.image_url || null,
      low_stock_threshold: parsed.data.low_stock_threshold,
      notes: parsed.data.notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") return { error: { item_code: ["Item code already exists"] } };
    return { error: { item_code: [error.message] } };
  }

  revalidatePath(`/products/${id}`);
  revalidatePath("/products");
  return { success: true };
}

export async function togglePhaseOut(id: string, phaseOut: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ is_phased_out: phaseOut, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(`/products/${id}`);
  revalidatePath("/products");
  return { success: true };
}

export async function addRolls(data: AddRollsFormData) {
  const parsed = addRollsSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();

  // Generate roll numbers server-side
  const rolls = [];
  for (let i = 0; i < parsed.data.num_rolls; i++) {
    const { data: rollNum } = await supabase.rpc("generate_roll_number", {
      p_product_id: parsed.data.product_id,
    });

    rolls.push({
      product_id: parsed.data.product_id,
      roll_number: rollNum,
      initial_length_m: parsed.data.length_per_roll,
      current_length_m: parsed.data.length_per_roll,
      received_date: parsed.data.received_date,
      notes: parsed.data.notes || null,
    });
  }

  const { error } = await supabase.from("rolls").insert(rolls);
  if (error) return { error: { num_rolls: [error.message] } };

  revalidatePath(`/products/${parsed.data.product_id}`);
  revalidatePath("/products");
  return { success: true, count: rolls.length };
}
