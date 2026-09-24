import { z } from "zod";

export const dayStatusSchema = z.object({
  content: z.string().trim().min(1).max(500),
});

export const monthQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12).optional(),
});

export type DayStatusRequest = z.output<typeof dayStatusSchema>;
export type MonthQuery = z.output<typeof monthQuerySchema>;
