import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: z
    .string()
    .trim()
    .email()
    .max(255)
    .transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(72),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .max(255)
    .transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(72),
});

export type RegisterRequest = z.output<typeof registerSchema>;
export type LoginRequest = z.output<typeof loginSchema>;
