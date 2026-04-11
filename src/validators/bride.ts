import { z } from "zod";

export const brideSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  phone: z.string().max(20).nullable().optional(),
  email: z.string().email().max(200).nullable().optional().or(z.literal("")),
  wedding_date: z.string().nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
});

export type BrideFormData = z.infer<typeof brideSchema>;
