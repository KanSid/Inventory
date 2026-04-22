"use server";

import { createClient } from "@/lib/supabase/server";
import { productSchema, type ProductFormData, addRollsSchema, type AddRollsFormData, addVariableRollsSchema, type AddVariableRollsFormData, addPieceBatchSchema, type AddPieceBatchFormData } from "@/validators/product";
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
      image_url: parsed.data.image_url || null,
      type_id: parsed.data.type_id || null,
      costing_category_id: parsed.data.costing_category_id || null,
      design_family_id: parsed.data.design_family_id || null,
      comment: parsed.data.comment || null,
      low_stock_threshold: parsed.data.low_stock_threshold,
    })
    .select("id, item_code")
    .single();

  if (error) {
    if (error.code === "23505") return { error: { item_code: ["Item code already exists"] } };
    return { error: { item_code: [error.message] } };
  }

  const supplierIds = parsed.data.supplier_ids ?? [];
  if (supplierIds.length > 0) {
    await supabase.from("product_suppliers").insert(
      supplierIds.map((sid) => ({ product_id: product.id, supplier_id: sid }))
    );
  }

  revalidatePath("/products");
  return { success: true, item_code: product.item_code };
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
      image_url: parsed.data.image_url || null,
      type_id: parsed.data.type_id || null,
      costing_category_id: parsed.data.costing_category_id || null,
      design_family_id: parsed.data.design_family_id || null,
      comment: parsed.data.comment || null,
      low_stock_threshold: parsed.data.low_stock_threshold,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") return { error: { item_code: ["Item code already exists"] } };
    return { error: { item_code: [error.message] } };
  }

  // Replace product_suppliers
  await supabase.from("product_suppliers").delete().eq("product_id", id);
  const supplierIds = parsed.data.supplier_ids ?? [];
  if (supplierIds.length > 0) {
    await supabase.from("product_suppliers").insert(
      supplierIds.map((sid) => ({ product_id: id, supplier_id: sid }))
    );
  }

  revalidatePath(`/products/${parsed.data.item_code}`);
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

  let insertedCount = 0;
  for (let i = 0; i < parsed.data.num_rolls; i++) {
    const { data: rollNum } = await supabase.rpc("generate_roll_number", {
      p_product_id: parsed.data.product_id,
    });

    const { error } = await supabase.from("rolls").insert({
      product_id: parsed.data.product_id,
      roll_number: rollNum,
      initial_length_m: parsed.data.length_per_roll,
      current_length_m: parsed.data.length_per_roll,
      received_date: parsed.data.received_date,
      notes: parsed.data.notes || null,
    });

    if (error) return { error: { num_rolls: [error.message] } };
    insertedCount++;
  }

  revalidatePath(`/products/${parsed.data.product_id}`);
  revalidatePath("/products");
  return { success: true, count: insertedCount };
}

export async function addPieceBatch(data: AddPieceBatchFormData) {
  const parsed = addPieceBatchSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: batchNum } = await supabase.rpc("generate_batch_number", {
    p_product_id: parsed.data.product_id,
  });

  const { error } = await supabase.from("piece_batches").insert({
    product_id: parsed.data.product_id,
    batch_number: batchNum,
    initial_count: parsed.data.count,
    current_count: parsed.data.count,
    received_date: parsed.data.received_date,
    notes: parsed.data.notes || null,
  });

  if (error) return { error: { count: [error.message] } };

  revalidatePath(`/products/${parsed.data.product_id}`);
  revalidatePath("/products");
  return { success: true };
}

export async function addVariableRolls(data: AddVariableRollsFormData) {
  const parsed = addVariableRollsSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();

  let insertedCount = 0;
  for (const roll of parsed.data.rolls) {
    const lengthInMeters =
      roll.unit === "yards" ? roll.length * 0.9144 : roll.length;

    const { data: rollNum } = await supabase.rpc("generate_roll_number", {
      p_product_id: parsed.data.product_id,
    });

    const { error } = await supabase.from("rolls").insert({
      product_id: parsed.data.product_id,
      roll_number: rollNum,
      initial_length_m: lengthInMeters,
      current_length_m: lengthInMeters,
      received_date: parsed.data.received_date,
      notes: parsed.data.notes || null,
    });

    if (error) return { error: { rolls: [error.message] } };
    insertedCount++;
  }

  revalidatePath(`/products/${parsed.data.product_id}`);
  revalidatePath("/products");
  return { success: true, count: insertedCount };
}
