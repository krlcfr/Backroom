import { z } from "zod";

const granularPermissionsSchema = z.object({
  salas_ver: z.boolean().optional(),
  salas_acceder: z.boolean().optional(),
  archivos_subir: z.boolean().optional(),
  archivos_editar: z.boolean().optional(),
  archivos_eliminar: z.boolean().optional(),
  salas_crear: z.boolean().optional(),
  salas_editar: z.boolean().optional(),
  salas_eliminar: z.boolean().optional(),
});

export const updateRoomPermissionsSchema = z.object({
  usuario_id: z.string().uuid(),
  permisos: granularPermissionsSchema,
  heredar_de_padre: z.boolean().optional(),
});

export type UpdateRoomPermissionsInput = z.infer<typeof updateRoomPermissionsSchema>;
