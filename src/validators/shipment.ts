import { z } from "zod";

export const shipmentSchema = z.object({
  shipment_number: z.string().min(1, "Shipment number is required"),
  date: z.string().nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
  items: z.array(z.object({
    supplier_id: z.string().uuid().nullable().optional(),
    product_id: z.string().uuid("Select a product"),
    quantity: z.coerce.number().positive("Must be positive"),
    input_unit: z.enum(["meters", "yards", "pieces"]),
    num_rolls: z.coerce.number().int().min(1).max(100),
    roll_lengths: z.array(z.number().positive()).nullable().optional(),
    notes: z.string().max(500).nullable().optional(),
  }).refine(
    (item) => item.input_unit !== "pieces" || (Number.isInteger(item.quantity) && item.num_rolls === 1),
    { message: "Piece items must have an integer quantity and exactly 1 batch" }
  )).min(1, "Add at least one item"),
});

export type ShipmentFormData = z.infer<typeof shipmentSchema>;
