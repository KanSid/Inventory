import { z } from "zod";

export const adjustmentSchema = z.object({
  roll_id: z.string().uuid().nullable().optional(),
  batch_id: z.string().uuid().nullable().optional(),
  adjustment_type: z.enum(["addition", "deduction", "damage", "correction"]),
  quantity: z.coerce.number().positive("Must be positive"),
  reason: z.string().min(1, "Reason is required").max(1000),
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

export type AdjustmentFormData = z.infer<typeof adjustmentSchema>;
