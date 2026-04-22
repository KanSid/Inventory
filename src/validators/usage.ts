import { z } from "zod";

export const usageSchema = z.object({
  bride_id: z.string().uuid("Select a bride"),
  roll_id: z.string().uuid().nullable().optional(),
  batch_id: z.string().uuid().nullable().optional(),
  quantity_used: z.coerce.number().positive("Must be positive"),
  usage_date: z.string().min(1, "Date is required"),
  notes: z.string().max(1000).nullable().optional(),
}).superRefine((data, ctx) => {
  const hasRoll = !!data.roll_id;
  const hasBatch = !!data.batch_id;
  if (!hasRoll && !hasBatch) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Select a roll or batch", path: ["roll_id"] });
  }
  if (hasRoll && hasBatch) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Cannot target both roll and batch", path: ["roll_id"] });
  }
});

export type UsageFormData = z.infer<typeof usageSchema>;
