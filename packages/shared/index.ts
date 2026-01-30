import { z } from 'zod';

// User Auth Schemas
export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  currency: z.string().default("BDT"),
  language: z.enum(["bn", "en"]).default("bn")
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});

// Transaction Schemas
export const TransactionType = z.enum(['INCOME', 'EXPENSE']);

export const TransactionSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  type: TransactionType,
  categoryId: z.string().uuid(),
  accountId: z.string().uuid().optional(),
  date: z.string().datetime(), // ISO string
  notes: z.string().optional(),
  tags: z.array(z.string()).optional()
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type TransactionInput = z.infer<typeof TransactionSchema>;
