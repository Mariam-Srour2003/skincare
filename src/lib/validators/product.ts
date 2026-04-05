import { z } from "zod";
import { PRODUCT_CATEGORIES, TIME_OF_USE_OPTIONS } from "@/lib/constants";

export const productSchema = z.object({
  name: z.string().min(2).max(120),
  brand: z.string().min(2).max(120),
  category: z.enum(PRODUCT_CATEGORIES),
  timeOfUse: z.enum(TIME_OF_USE_OPTIONS),
  notes: z.string().max(3000).optional().nullable(),
  imageUrl: z.string().max(300).optional().nullable(),
  isActive: z.boolean().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
