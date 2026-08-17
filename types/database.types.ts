// ============================================================
// Tipos de base de datos — BackRoom
// Generados manualmente a partir del esquema real en Supabase.
// Última actualización: 2026-08-07
// ============================================================

// ─── Tablas principales ──────────────────────────────────────

export interface Usuario {
  id: string;
  auth_id: string;
  es_superadmin: boolean;
  username: string;
  nombre_completo: string;
  correo: string;
  activo: boolean;
  created_at: string;
}

export interface Organizacion {
  id: string;
  owner_id: string; // FK → usuarios.id (Propietario, RN-01)
  name: string;
  description: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrganizacionMiembro {
  id: string;
  organization_id: string; // FK → organizations.id
  user_id: string;         // FK → usuarios.id
  role: RolOrg;            // admin | member (Propietario vía owner_id, R-09)
  status: EstadoMiembro;   // active | pending
  joined_at: string | null;
  last_access_at: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface BackRoom {
  id: string;
  propietario_id: string; // FK → usuarios.id
  nombre: string;
  descripcion: string | null;
  portada_url: string | null;
  created_at: string;
}

export interface BackRoomMiembro {
  id: string;
  backroom_id: string; // FK → backrooms.id
  usuario_id: string;  // FK → usuarios.id
  permiso: Permiso;
  asignado_por: string | null; // FK → usuarios.id
  created_at: string;
  updated_at: string;
}

export interface Sala {
  id: string;
  backroom_id: string;  // FK → backrooms.id
  parent_id: string | null; // FK → salas.id (árbol recursivo)
  nombre: string;
  descripcion: string | null;
  depth: number;          // 0 = sala raíz del backroom
  created_at: string;
}

export interface SalaPermiso {
  id: string;
  sala_id: string;
  usuario_id: string;
  salas_ver: boolean;
  salas_acceder: boolean;
  archivos_subir: boolean;
  archivos_editar: boolean;
  archivos_eliminar: boolean;
  salas_crear: boolean;
  salas_editar: boolean;
  salas_eliminar: boolean;
  created_at: string;
  updated_at: string;
}

// Sala con sus hijas (usada en árbol recursivo)
export interface SalaConHijas extends Sala {
  children: SalaConHijas[];
}

export interface Recurso {
  id: string;
  sala_id: string;    // FK → salas.id
  subido_por: string; // FK → usuarios.id
  nombre: string;
  tipo: TipoRecurso;
  url: string;
  tamano_bytes: number | null;
  created_at: string;
}

export interface Invitacion {
  id: string;
  backroom_id: string; // FK → backrooms.id
  creado_por: string;  // FK → usuarios.id
  email: string;
  codigo: string;
  link_token: string;  // UUID generado automáticamente
  activa: boolean;
  expira_en: string | null;
  created_at: string;
}

export interface Plan {
  id: string;
  nombre: string;
  max_backrooms: number;
  max_salas: number;
  created_at: string;
}

export interface AuditLog {
  id: string;
  backroom_id: string; // FK -> backrooms.id
  actor_id: string; // FK -> usuarios.id
  action: string;
  target_type: string;
  target_id: string | null;
  details: Record<string, any> | null;
  ip_address: string | null;
  created_at: string;
}

export interface Rol {
  id: string;
  nombre: string;
}

// ─── Tipos utilitarios ───────────────────────────────────────

/** Permisos disponibles en backroom_miembros */
export type Permiso = "solo_visualizar" | "contribuir";

/** Roles fijos de organización (R-09): admin | member. Propietario vía owner_id */
export type RolOrg = "admin" | "member";

/** Estado de membresía en organización */
export type EstadoMiembro = "active" | "pending";

/** Tipos de recurso permitidos */
export type TipoRecurso = "docx" | "pptx" | "mp3" | "mp4" | "enlace";

/** Códigos de permiso granular por sala */
export type CodigoPermiso =
  | "salas.ver"
  | "salas.acceder"
  | "salas.crear"
  | "salas.editar"
  | "salas.eliminar"
  | "archivos.subir"
  | "archivos.editar"
  | "archivos.eliminar";

// ─── Tipos de respuesta API ──────────────────────────────────

/** Respuesta estándar de éxito de la API */
export interface ApiResponse<T> {
  data: T;
}

/** Respuesta estándar de error de la API */
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// ─── Tipos enriquecidos (joins) ──────────────────────────────

/** BackRoomMiembro con datos del usuario */
export interface MiembroConUsuario extends BackRoomMiembro {
  usuarios: Pick<Usuario, "username" | "nombre_completo" | "correo"> | null;
}

/** Invitacion con datos del backroom */
export interface InvitacionConBackroom extends Invitacion {
  backrooms: Pick<BackRoom, "nombre"> | null;
}

/** Recurso con datos del usuario que lo subió */
export interface RecursoConUsuario extends Recurso {
  usuarios: Pick<Usuario, "username"> | null;
}
