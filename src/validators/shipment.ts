import { z } from "zod";

export const shipmentSchema = z.object({
  supplier_id: z.string().uuid().nullable().optional(),
  expected_date: z.string().nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
  items: z.array(z.object({
    supplier_id: z.string().uuid().nullable().optional(),
    product_id: z.string().uuid("Select a product"),
    quantity: z.coerce.number().positive("Must be positive"),
    input_unit: z.enum(["meters", "yards", "pairs"]),
    num_rolls: z.coerce.number().int().min(1).max(100),
    notes: z.string().max(500).nullable().optional(),
  })).min(1, "Add at least one item"),
});

export type ShipmentFormData = z.infer<typeof shipmentSchema>;
