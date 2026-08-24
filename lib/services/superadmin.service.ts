import { createAdminClient } from "@/lib/supabase/admin";
import { getUsuarioInterno } from "@/lib/auth/rbac";
import { ApiError } from "@/lib/api-error";

export class SuperAdminService {
  /**
   * Verifica si un usuario es superadmin basándose en su auth_id
   */
  static async isSuperAdmin(authId: string): Promise<boolean> {
    const usuario = await getUsuarioInterno(authId);
    return usuario?.es_superadmin === true;
  }

  /**
   * Obtiene métricas globales de la plataforma
   */
  static async getPlatformMetrics() {
    const admin = createAdminClient();

    // Promesas concurrentes para mayor velocidad
    const [
      { count: usersCount },
      { count: orgsCount },
      { count: roomsCount },
      { data: resourcesData }
    ] = await Promise.all([
      admin.from("usuarios").select("*", { count: "exact", head: true }),
      admin.from("organizations").select("*", { count: "exact", head: true }),
      admin.from("salas").select("*", { count: "exact", head: true }),
      admin.from("recursos").select("tamano_bytes")
    ]);

    const totalStorageBytes = resourcesData?.reduce((acc, curr) => acc + (curr.tamano_bytes || 0), 0) || 0;

    return {
      users: usersCount || 0,
      organizations: orgsCount || 0,
      rooms: roomsCount || 0,
      storageBytes: totalStorageBytes,
    };
  }
}
