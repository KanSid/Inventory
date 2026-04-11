import { z } from "zod";

export const usageSchema = z.object({
  bride_id: z.string().uuid("Select a bride"),
  roll_id: z.string().uuid("Select a roll"),
  quantity_used: z.coerce
    .number()
    .positive("Must be positive")
    .multipleOf(0.5, "Must be in 0.5m increments"),
  usage_date: z.string().min(1, "Date is required"),
  notes: z.string().max(1000).nullable().optional(),
});

export type UsageFormData = z.infer<typeof usageSchema>;
