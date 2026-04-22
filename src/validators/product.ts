import { z } from "zod";

export const productSchema = z.object({
  item_code: z.string().min(1, "Item code is required").max(50),
  description: z.string().max(500).nullable().optional(),
  category_id: z.string().uuid("Select a category"),
  image_url: z.string().url("Must be a valid URL").nullable().optional(),
  type_id: z.string().uuid().nullable().optional(),
  costing_category_id: z.string().uuid().nullable().optional(),
  design_family_id: z.string().uuid().nullable().optional(),
  comment: z.string().max(1000).nullable().optional(),
  low_stock_threshold: z.coerce.number().min(0, "Must be 0 or more").default(10),
  is_phased_out: z.boolean().optional().default(false),
  supplier_ids: z.array(z.string().uuid()).optional().default([]),
});

export type ProductFormData = z.infer<typeof productSchema>;

export const rollSchema = z.object({
  product_id: z.string().uuid(),
  initial_length_m: z.coerce.number().positive("Length must be positive"),
  received_date: z.string().min(1, "Date is required"),
  notes: z.string().max(500).nullable().optional(),
});

export type RollFormData = z.infer<typeof rollSchema>;

export const addRollsSchema = z.object({
  product_id: z.string().uuid(),
  num_rolls: z.coerce.number().int().min(1).max(50),
  length_per_roll: z.coerce.number().positive("Length must be positive"),
  received_date: z.string().min(1, "Date is required"),
  notes: z.string().max(500).nullable().optional(),
});

export type AddRollsFormData = z.infer<typeof addRollsSchema>;

export const rollEntrySchema = z.object({
  length: z.coerce.number().positive("Length must be positive"),
  unit: z.enum(["meters", "yards"], { message: "Select a unit" }),
});

export type RollEntry = {
  length: string | number;
  unit: "meters" | "yards";
};

export const addPieceBatchSchema = z.object({
  product_id: z.string().uuid(),
  count: z.coerce.number().int().min(1, "Must be at least 1"),
  received_date: z.string().min(1, "Date is required"),
  notes: z.string().max(500).nullable().optional(),
});

export type AddPieceBatchFormData = z.infer<typeof addPieceBatchSchema>;

export const addVariableRollsSchema = z.object({
  product_id: z.string().uuid(),
  rolls: z.array(rollEntrySchema).min(1, "Add at least one roll"),
  received_date: z.string().min(1, "Date is required"),
  notes: z.string().max(500).nullable().optional(),
});

export type AddVariableRollsFormData = z.infer<typeof addVariableRollsSchema>;

