import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .max(255)
    .transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(72),
});

export const loginSchema = registerSchema;

export type RegisterRequest = z.output<typeof registerSchema>;
export type LoginRequest = z.output<typeof loginSchema>;
