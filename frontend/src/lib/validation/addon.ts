import { z } from "zod";

export const addOnCatalogSchema = z.object({
  name: z.string().min(1, "Name is required"),
  defaultPrice: z.number().min(0, "Price must be positive"),
  isActive: z.boolean().default(true),
});

export type AddOnCatalogFormValues = z.infer<typeof addOnCatalogSchema>;
