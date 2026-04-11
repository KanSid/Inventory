import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
  description: z.string().max(500).nullable().optional(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
