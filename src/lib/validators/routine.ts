import { z } from "zod";
import { DAYS_OF_WEEK, ROUTINE_PERIODS } from "@/lib/constants";

export const routineItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string().min(1),
  displayOrder: z.number().int().min(1),
  instructions: z.string().max(500).optional().nullable(),
});

export const routineSchema = z.object({
  name: z.string().min(2).max(100),
  daysOfWeek: z.array(z.enum(DAYS_OF_WEEK)).default([]),
  period: z.enum(ROUTINE_PERIODS),
  isDefault: z.boolean().optional(),
  items: z.array(routineItemSchema).min(1),
});

export const reorderRoutineItemsSchema = z.object({
  itemIds: z.array(z.string()).min(1),
});
