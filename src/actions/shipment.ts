"use server";

import { createClient } from "@/lib/supabase/server";
import { shipmentSchema, type ShipmentFormData } from "@/validators/shipment";
import { revalidatePath } from "next/cache";

export async function createShipment(data: ShipmentFormData) {
  const parsed = shipmentSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();

  // Generate shipment number
  const { data: shipmentNumber } = await supabase.rpc("generate_shipment_number");

  // Create shipment
  const { data: shipment, error: shipError } = await supabase
    .from("shipments")
    .insert({
      shipment_number: shipmentNumber,
      supplier_id: parsed.data.supplier_id,
      expected_date: parsed.data.expected_date || null,
      notes: parsed.data.notes || null,
    })
    .select("id")
    .single();

  if (shipError) return { error: { supplier_id: [shipError.message] } };

  // Create shipment items
  const items = parsed.data.items.map((item) => {
    const qtyMeters = item.input_unit === "yards"
      ? item.quantity * 0.9144
      : item.quantity;
    return {
      shipment_id: shipment.id,
      product_id: item.product_id,
      quantity: item.quantity,
      input_unit: item.input_unit,
      quantity_in_meters: qtyMeters,
      num_rolls: item.num_rolls,
      notes: item.notes || null,
    };
  });

  const { error: itemsError } = await supabase.from("shipment_items").insert(items);
  if (itemsError) return { error: { supplier_id: [itemsError.message] } };

  revalidatePath("/shipments");
  return { success: true, id: shipment.id };
}

export async function receiveShipment(shipmentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Get shipment items
  const { data: items } = await supabase
    .from("shipment_items")
    .select("*, products(id, item_code)")
    .eq("shipment_id", shipmentId);

  if (!items || items.length === 0) return { error: "No items in shipment" };

  // Create rolls for each item
  for (const item of items) {
    const lengthPerRoll = item.quantity_in_meters / item.num_rolls;

    for (let i = 0; i < item.num_rolls; i++) {
      const { data: rollNum } = await supabase.rpc("generate_roll_number", {
        p_product_id: item.product_id,
      });

      await supabase.from("rolls").insert({
        product_id: item.product_id,
        roll_number: rollNum,
        initial_length_m: lengthPerRoll,
        current_length_m: lengthPerRoll,
        shipment_id: shipmentId,
        received_date: new Date().toISOString().split("T")[0],
      });
    }
  }

  // Update shipment status
  await supabase
    .from("shipments")
    .update({
      status: "received",
      received_date: new Date().toISOString().split("T")[0],
      received_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", shipmentId);

  // Log activity
  await supabase.from("inventory_activity_log").insert({
    user_id: user.id,
    action_type: "shipment_received",
    entity_type: "shipment",
    entity_id: shipmentId,
    details: { items_count: items.length },
  });

  revalidatePath("/shipments");
  revalidatePath("/products");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function cancelShipment(shipmentId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("shipments")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", shipmentId);

  if (error) return { error: error.message };

  revalidatePath("/shipments");
  return { success: true };
}
