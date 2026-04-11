import { z } from "zod";

export const adjustmentSchema = z.object({
  roll_id: z.string().uuid("Select a roll"),
  adjustment_type: z.enum(["addition", "deduction", "damage", "correction"]),
  quantity: z.coerce.number().positive("Must be positive"),
  reason: z.string().min(1, "Reason is required").max(1000),
});

export type AdjustmentFormData = z.infer<typeof adjustmentSchema>;
