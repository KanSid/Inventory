"use server";

import { createClient } from "@/lib/supabase/server";
import { shipmentSchema, type ShipmentFormData } from "@/validators/shipment";
import { revalidatePath } from "next/cache";

export async function createShipment(data: ShipmentFormData) {
  const parsed = shipmentSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();

  const { data: shipment, error: shipError } = await supabase
    .from("shipments")
    .insert({
      shipment_number: parsed.data.shipment_number,
      date: parsed.data.date || null,
      notes: parsed.data.notes || null,
    })
    .select("id")
    .single();

  if (shipError) {
    if (shipError.code === "23505") return { error: { shipment_number: ["Shipment number already exists"] } };
    return { error: { shipment_number: [shipError.message] } };
  }

  const items = parsed.data.items.map((item) => {
    const toMeters = (v: number) => item.input_unit === "yards" ? v * 0.9144 : v;
    const qtyMeters = toMeters(item.quantity);
    const rollLengthsMeters = item.roll_lengths?.map(toMeters) ?? null;
    return {
      shipment_id: shipment.id,
      product_id: item.product_id,
      supplier_id: item.supplier_id || null,
      quantity: item.quantity,
      input_unit: item.input_unit,
      quantity_in_meters: qtyMeters,
      num_rolls: item.num_rolls,
      roll_lengths: rollLengthsMeters,
      notes: item.notes || null,
    };
  });

  const { error: itemsError } = await supabase.from("shipment_items").insert(items);
  if (itemsError) return { error: { shipment_number: [itemsError.message] } };

  revalidatePath("/shipments");
  return { success: true, id: shipment.id };
}

export async function createAndReceiveShipment(data: ShipmentFormData, receivedDate?: string) {
  const parsed = shipmentSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: { shipment_number: ["Not authenticated"] } };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin" && profile?.role !== "inventory_manager") {
    return { error: { shipment_number: ["Unauthorized"] } };
  }

  const date = receivedDate || parsed.data.date || new Date().toISOString().split("T")[0];

  const { data: shipment, error: shipError } = await supabase
    .from("shipments")
    .insert({ shipment_number: parsed.data.shipment_number, date, notes: parsed.data.notes || null })
    .select("id")
    .single();

  if (shipError) {
    if (shipError.code === "23505") return { error: { shipment_number: ["Shipment number already exists"] } };
    return { error: { shipment_number: [shipError.message] } };
  }

  const toMeters = (v: number, unit: string) => unit === "yards" ? v * 0.9144 : v;

  const itemRows = parsed.data.items.map((item) => {
    const qtyM = toMeters(item.quantity, item.input_unit);
    const rollLengthsM = item.roll_lengths?.map((l) => toMeters(l, item.input_unit)) ?? null;
    return {
      shipment_id: shipment.id,
      product_id: item.product_id,
      supplier_id: item.supplier_id || null,
      quantity: item.quantity,
      input_unit: item.input_unit,
      quantity_in_meters: qtyM,
      num_rolls: item.num_rolls,
      roll_lengths: rollLengthsM,
      notes: item.notes || null,
      received_quantity_in_meters: qtyM,
      received_num_rolls: item.input_unit === "pieces" ? 1 : item.num_rolls,
      received_roll_lengths: item.input_unit === "pieces" ? null : rollLengthsM,
    };
  });

  const { error: itemsError } = await supabase.from("shipment_items").insert(itemRows);
  if (itemsError) return { error: { shipment_number: [itemsError.message] } };

  const productIds = [...new Set(parsed.data.items.map((i) => i.product_id))];
  const { data: productData } = await supabase
    .from("products").select("id, categories(unit)").in("id", productIds);

  const unitMap: Record<string, string> = {};
  (productData ?? []).forEach((p: any) => { unitMap[p.id] = p.categories?.unit ?? "roll"; });

  for (const item of parsed.data.items) {
    const stockUnit = unitMap[item.product_id] ?? "roll";
    const qtyM = toMeters(item.quantity, item.input_unit);
    const rollLengthsM = item.roll_lengths?.map((l) => toMeters(l, item.input_unit)) ?? null;

    if (stockUnit === "pieces") {
      const { data: batchNum } = await supabase.rpc("generate_batch_number", { p_product_id: item.product_id });
      await supabase.from("piece_batches").insert({
        product_id: item.product_id, batch_number: batchNum,
        initial_count: Math.round(qtyM), current_count: Math.round(qtyM),
        shipment_id: shipment.id, received_date: date,
      });
    } else {
      for (let i = 0; i < item.num_rolls; i++) {
        const lengthM = rollLengthsM?.[i] ?? qtyM / item.num_rolls;
        const { data: rollNum } = await supabase.rpc("generate_roll_number", { p_product_id: item.product_id });
        await supabase.from("rolls").insert({
          product_id: item.product_id, roll_number: rollNum,
          initial_length_m: lengthM, current_length_m: lengthM,
          shipment_id: shipment.id, received_date: date,
        });
      }
    }
  }

  await supabase.from("shipments").update({
    status: "received", received_by: user.id, date,
    updated_at: new Date().toISOString(),
  }).eq("id", shipment.id);

  const supplierIds = [...new Set(parsed.data.items.map((i) => i.supplier_id).filter(Boolean))] as string[];
  const suppliersSet = new Set<string>();
  if (supplierIds.length > 0) {
    const { data: suppData } = await supabase.from("suppliers").select("id, name").in("id", supplierIds);
    (suppData ?? []).forEach((s: any) => suppliersSet.add(s.name));
  }

  await supabase.from("inventory_activity_log").insert({
    user_id: user.id, action_type: "shipment_received",
    entity_type: "shipment", entity_id: shipment.id,
    details: {
      shipment: parsed.data.shipment_number, supplier_count: suppliersSet.size,
      suppliers: Array.from(suppliersSet), items_count: parsed.data.items.length,
      has_discrepancies: false, direct_receive: true,
    },
  });

  revalidatePath("/shipments");
  revalidatePath("/products");
  revalidatePath("/dashboard");
  return { success: true, id: shipment.id };
}

export async function receiveShipment(shipmentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Get shipment date for roll received_date
  const { data: shipmentData } = await supabase
    .from("shipments")
    .select("shipment_number, date")
    .eq("id", shipmentId)
    .single();

  const receivedDate = shipmentData?.date ?? new Date().toISOString().split("T")[0];

  const { data: items } = await supabase
    .from("shipment_items")
    .select("*, products(id, item_code, categories(unit))")
    .eq("shipment_id", shipmentId);

  if (!items || items.length === 0) return { error: "No items in shipment" };

  for (const item of items) {
    const productData = item.products as any;
    const stockUnit = productData?.categories?.unit ?? "roll";

    if (stockUnit === "pieces") {
      const { data: batchNum } = await supabase.rpc("generate_batch_number", {
        p_product_id: item.product_id,
      });
      await supabase.from("piece_batches").insert({
        product_id: item.product_id,
        batch_number: batchNum,
        initial_count: Math.round(item.quantity_in_meters),
        current_count: Math.round(item.quantity_in_meters),
        shipment_id: shipmentId,
        received_date: receivedDate,
      });
    } else {
      const rollLengths = item.roll_lengths as number[] | null;
      for (let i = 0; i < item.num_rolls; i++) {
        const lengthM = rollLengths?.[i] ?? item.quantity_in_meters / item.num_rolls;
        const { data: rollNum } = await supabase.rpc("generate_roll_number", {
          p_product_id: item.product_id,
        });
        await supabase.from("rolls").insert({
          product_id: item.product_id,
          roll_number: rollNum,
          initial_length_m: lengthM,
          current_length_m: lengthM,
          shipment_id: shipmentId,
          received_date: receivedDate,
        });
      }
    }
  }

  await supabase
    .from("shipments")
    .update({
      status: "received",
      received_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", shipmentId);

  // Get unique suppliers from items for activity log
  const { data: itemsWithSuppliers } = await supabase
    .from("shipment_items")
    .select("supplier_id, suppliers(name)")
    .eq("shipment_id", shipmentId);

  const suppliersSet = new Set<string>();
  if (itemsWithSuppliers) {
    (itemsWithSuppliers as any[]).forEach((item) => {
      if (item.suppliers?.name) suppliersSet.add(item.suppliers.name);
    });
  }

  await supabase.from("inventory_activity_log").insert({
    user_id: user.id,
    action_type: "shipment_received",
    entity_type: "shipment",
    entity_id: shipmentId,
    details: {
      shipment: shipmentData?.shipment_number ?? "Unknown",
      supplier_count: suppliersSet.size,
      suppliers: Array.from(suppliersSet),
      items_count: items.length,
    },
  });

  revalidatePath("/shipments");
  revalidatePath("/products");
  revalidatePath("/dashboard");
  return { success: true };
}

interface ReceiveItemInput {
  itemId: string;
  receivedQuantityInMeters: number;
  receivedNumRolls: number;
  receivedRollLengths: number[];
}

export async function receiveShipmentVerified(
  shipmentId: string,
  itemData: ReceiveItemInput[],
  receivedDate: string,
  receivedNotes?: string,
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin" && profile?.role !== "inventory_manager") {
    return { error: "Unauthorized" };
  }

  const { data: shipmentData } = await supabase
    .from("shipments")
    .select("shipment_number, date, status")
    .eq("id", shipmentId)
    .single();

  if (!shipmentData || shipmentData.status !== "pending") {
    return { error: "Shipment is not pending" };
  }


  const { data: dbItems } = await supabase
    .from("shipment_items")
    .select("id, product_id, supplier_id, products(categories(unit)), suppliers(name)")
    .eq("shipment_id", shipmentId);

  if (!dbItems || dbItems.length === 0) return { error: "No items in shipment" };

  const dbItemMap = Object.fromEntries(dbItems.map((i) => [i.id, i]));

  for (const rd of itemData) {
    const dbItem = dbItemMap[rd.itemId];
    if (!dbItem) continue;

    const productData = dbItem.products as any;
    const stockUnit: string = productData?.categories?.unit ?? "roll";

    await supabase.from("shipment_items").update({
      received_quantity_in_meters: rd.receivedQuantityInMeters,
      received_num_rolls: rd.receivedNumRolls,
      received_roll_lengths: stockUnit !== "pieces" ? rd.receivedRollLengths : null,
    }).eq("id", rd.itemId);

    if (stockUnit === "pieces") {
      const { data: batchNum } = await supabase.rpc("generate_batch_number", {
        p_product_id: dbItem.product_id,
      });
      await supabase.from("piece_batches").insert({
        product_id: dbItem.product_id,
        batch_number: batchNum,
        initial_count: Math.round(rd.receivedQuantityInMeters),
        current_count: Math.round(rd.receivedQuantityInMeters),
        shipment_id: shipmentId,
        received_date: receivedDate,
      });
    } else {
      for (let i = 0; i < rd.receivedNumRolls; i++) {
        const lengthM = rd.receivedRollLengths[i] ?? rd.receivedQuantityInMeters / rd.receivedNumRolls;
        const { data: rollNum } = await supabase.rpc("generate_roll_number", {
          p_product_id: dbItem.product_id,
        });
        await supabase.from("rolls").insert({
          product_id: dbItem.product_id,
          roll_number: rollNum,
          initial_length_m: lengthM,
          current_length_m: lengthM,
          shipment_id: shipmentId,
          received_date: receivedDate,
        });
      }
    }
  }

  await supabase.from("shipments").update({
    status: "received",
    received_by: user.id,
    date: receivedDate,
    received_notes: receivedNotes || null,
    updated_at: new Date().toISOString(),
  }).eq("id", shipmentId);

  const suppliersSet = new Set<string>();
  (dbItems as any[]).forEach((item) => {
    if (item.suppliers?.name) suppliersSet.add(item.suppliers.name);
  });

  await supabase.from("inventory_activity_log").insert({
    user_id: user.id,
    action_type: "shipment_received",
    entity_type: "shipment",
    entity_id: shipmentId,
    details: {
      shipment: shipmentData.shipment_number,
      supplier_count: suppliersSet.size,
      suppliers: Array.from(suppliersSet),
      items_count: itemData.length,
      has_discrepancies: !!receivedNotes,
    },
  });

  revalidatePath("/shipments");
  revalidatePath("/products");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function renameShipment(shipmentId: string, shipmentNumber: string) {
  const trimmed = shipmentNumber.trim();
  if (!trimmed) return { error: "Shipment number is required" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin" && profile?.role !== "inventory_manager") {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("shipments")
    .update({ shipment_number: trimmed, updated_at: new Date().toISOString() })
    .eq("id", shipmentId);

  if (error) {
    if (error.code === "23505") return { error: "Shipment number already exists" };
    return { error: error.message };
  }

  revalidatePath("/shipments");
  revalidatePath(`/shipments/${shipmentId}`);
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

export async function updateShipment(shipmentId: string, data: ShipmentFormData) {
  const parsed = shipmentSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: { shipment_number: ["Not authenticated"] } };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin" && profile?.role !== "inventory_manager") {
    return { error: { shipment_number: ["Unauthorized"] } };
  }

  const { data: existing } = await supabase
    .from("shipments").select("status").eq("id", shipmentId).single();
  if (!existing) return { error: { shipment_number: ["Shipment not found"] } };
  if (existing.status !== "pending") {
    return { error: { shipment_number: ["Only pending shipments can be edited"] } };
  }

  const { error: updError } = await supabase
    .from("shipments")
    .update({
      shipment_number: parsed.data.shipment_number,
      date: parsed.data.date || null,
      notes: parsed.data.notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", shipmentId);

  if (updError) {
    if (updError.code === "23505") return { error: { shipment_number: ["Shipment number already exists"] } };
    return { error: { shipment_number: [updError.message] } };
  }

  // Replace line items
  await supabase.from("shipment_items").delete().eq("shipment_id", shipmentId);

  const items = parsed.data.items.map((item) => {
    const toMeters = (v: number) => item.input_unit === "yards" ? v * 0.9144 : v;
    const qtyMeters = toMeters(item.quantity);
    const rollLengthsMeters = item.roll_lengths?.map(toMeters) ?? null;
    return {
      shipment_id: shipmentId,
      product_id: item.product_id,
      supplier_id: item.supplier_id || null,
      quantity: item.quantity,
      input_unit: item.input_unit,
      quantity_in_meters: qtyMeters,
      num_rolls: item.num_rolls,
      roll_lengths: rollLengthsMeters,
      notes: item.notes || null,
    };
  });

  const { error: itemsError } = await supabase.from("shipment_items").insert(items);
  if (itemsError) return { error: { shipment_number: [itemsError.message] } };

  revalidatePath("/shipments");
  revalidatePath(`/shipments/${shipmentId}`);
  return { success: true, id: shipmentId };
}

export async function deleteShipment(shipmentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin" && profile?.role !== "inventory_manager") {
    return { error: "Unauthorized" };
  }

  const { data: shipment } = await supabase
    .from("shipments").select("status").eq("id", shipmentId).single();
  if (!shipment) return { error: "Shipment not found" };
  if (shipment.status === "received") {
    return { error: "Cannot delete a received shipment — its stock has already been added" };
  }

  await supabase.from("shipment_items").delete().eq("shipment_id", shipmentId);
  const { error } = await supabase.from("shipments").delete().eq("id", shipmentId);
  if (error) return { error: error.message };

  revalidatePath("/shipments");
  return { success: true };
}
