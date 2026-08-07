import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(3).max(50),
  fullName: z.string().min(1).max(150),
  email: z.string().email(),
  password: z.string().min(8),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  code: z.string().min(1),
  password: z.string().min(8),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const createBackroomSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  coverUrl: z.string().url().optional().nullable(),
});

export type CreateBackroomInput = z.infer<typeof createBackroomSchema>;

export const updateBackroomSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  coverUrl: z.string().url().optional().nullable(),
});

export type UpdateBackroomInput = z.infer<typeof updateBackroomSchema>;
