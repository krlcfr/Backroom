export interface Usuario {
  id: string
  auth_id: string
  es_superadmin: boolean
  username: string
  nombre_completo: string
  correo: string
  activo: boolean
  created_at: string
}

export interface BackRoom {
  id: string
  propietario_id: string
  nombre: string
  descripcion: string | null
  portada_url: string | null
  created_at: string
}

export interface Sala {
  id: string
  backroom_id: string
  nombre: string
  descripcion: string | null
  created_at: string
}

export interface Recurso {
  id: string
  sala_id: string
  subido_por: string
  nombre: string
  tipo: "docx" | "pptx" | "mp3" | "mp4" | "enlace"
  url: string
  tamano_bytes: number | null
  created_at: string
}

export interface BackRoomMiembro {
  id: string
  backroom_id: string
  usuario_id: string
  permiso: "solo_visualizar" | "contribuir"
  asignado_por: string | null
  created_at: string
  updated_at: string
}

export interface Invitacion {
  id: string
  backroom_id: string
  creado_por: string
  codigo: string
  link_token: string
  activa: boolean
  expira_en: string | null
  created_at: string
}

export interface Plan {
  id: string
  nombre: "gratuito" | "pro" | "premium"
  max_backrooms: number
  max_salas: number
  created_at: string
}
