import { z } from "zod";

export const supplierSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  contact_person: z.string().max(200).nullable().optional(),
  email: z.string().email().max(200).nullable().optional().or(z.literal("")),
  phone: z.string().max(20).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
});

export type SupplierFormData = z.infer<typeof supplierSchema>;
