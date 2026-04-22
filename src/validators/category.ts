import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  unit: z.enum(["roll", "pieces"]),
  description: z.string().max(500).nullable().optional(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
