import { z } from "zod";
import { ROUTINE_PERIODS } from "@/lib/constants";

export const toggleDailyItemSchema = z.object({
  productId: z.string().min(1),
  routinePeriod: z.enum(ROUTINE_PERIODS),
  completed: z.boolean(),
});

export const dailyNoteSchema = z.object({
  note: z.string().max(2000).optional().nullable(),
});
