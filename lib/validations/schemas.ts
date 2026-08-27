import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  captchaToken: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  captchaToken: z.string().min(1),
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
  icono: z.string().optional(),
});

export type CreateBackroomInput = z.infer<typeof createBackroomSchema>;

export const updateBackroomSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  coverUrl: z.string().url().optional().nullable(),
  icono: z.string().optional(),
});

export type UpdateBackroomInput = z.infer<typeof updateBackroomSchema>;

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional().nullable(),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;

export const updateOrganizationSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
});

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;

export const updateMemberRoleSchema = z.object({
  role: z.enum(["admin", "member"]),
});

export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;

export const createCargoSchema = z.object({
  nombre: z.string().trim().min(1).max(200),
  descripcion: z.string().trim().max(2000).optional().nullable(),
});

export type CreateCargoInput = z.infer<typeof createCargoSchema>;

export const updateCargoSchema = z.object({
  nombre: z.string().trim().min(1).max(200).optional(),
  descripcion: z.string().trim().max(2000).nullable().optional(),
});

export type UpdateCargoInput = z.infer<typeof updateCargoSchema>;


export const updateMemberCargoSchema = z.object({
  cargo_id: z.string().uuid().nullable(),
});
export type UpdateMemberCargoInput = z.infer<typeof updateMemberCargoSchema>;

