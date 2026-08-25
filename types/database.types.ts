export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          organization_id: string
          target_id: string | null
          target_type: string
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          organization_id: string
          target_id?: string | null
          target_type: string
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          organization_id?: string
          target_id?: string | null
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      backroom_miembros: {
        Row: {
          asignado_por: string | null
          backroom_id: string
          created_at: string
          id: string
          permiso: string
          updated_at: string
          usuario_id: string
        }
        Insert: {
          asignado_por?: string | null
          backroom_id: string
          created_at?: string
          id?: string
          permiso?: string
          updated_at?: string
          usuario_id: string
        }
        Update: {
          asignado_por?: string | null
          backroom_id?: string
          created_at?: string
          id?: string
          permiso?: string
          updated_at?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "backroom_miembros_asignado_por_fkey"
            columns: ["asignado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "backroom_miembros_backroom_id_fkey"
            columns: ["backroom_id"]
            isOneToOne: false
            referencedRelation: "backrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "backroom_miembros_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      backrooms: {
        Row: {
          created_at: string
          descripcion: string | null
          icono: string
          id: string
          nombre: string
          portada_url: string | null
          propietario_id: string
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          icono?: string
          id?: string
          nombre: string
          portada_url?: string | null
          propietario_id: string
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          icono?: string
          id?: string
          nombre?: string
          portada_url?: string | null
          propietario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "backrooms_propietario_id_fkey"
            columns: ["propietario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      document_signatures: {
        Row: {
          created_at: string | null
          height: number
          id: string
          page_number: number
          pos_x: number
          pos_y: number
          recurso_id: string
          signature_image_url: string
          usuario_id: string
          width: number
        }
        Insert: {
          created_at?: string | null
          height: number
          id?: string
          page_number: number
          pos_x: number
          pos_y: number
          recurso_id: string
          signature_image_url: string
          usuario_id: string
          width: number
        }
        Update: {
          created_at?: string | null
          height?: number
          id?: string
          page_number?: number
          pos_x?: number
          pos_y?: number
          recurso_id?: string
          signature_image_url?: string
          usuario_id?: string
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_signatures_recurso_id_fkey"
            columns: ["recurso_id"]
            isOneToOne: false
            referencedRelation: "recursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_signatures_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      invitaciones: {
        Row: {
          activa: boolean
          backroom_id: string
          codigo: string
          creado_por: string
          created_at: string
          email: string
          expira_en: string | null
          id: string
          link_token: string
        }
        Insert: {
          activa?: boolean
          backroom_id: string
          codigo: string
          creado_por: string
          created_at?: string
          email?: string
          expira_en?: string | null
          id?: string
          link_token?: string
        }
        Update: {
          activa?: boolean
          backroom_id?: string
          codigo?: string
          creado_por?: string
          created_at?: string
          email?: string
          expira_en?: string | null
          id?: string
          link_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitaciones_backroom_id_fkey"
            columns: ["backroom_id"]
            isOneToOne: false
            referencedRelation: "backrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitaciones_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invitations: {
        Row: {
          created_at: string
          created_by: string
          email: string
          expires_at: string
          id: string
          organization_id: string
          role: string
          status: string
          token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          email: string
          expires_at: string
          id?: string
          organization_id: string
          role?: string
          status?: string
          token: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          email?: string
          expires_at?: string
          id?: string
          organization_id?: string
          role?: string
          status?: string
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invitations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          joined_at: string | null
          last_access_at: string | null
          organization_id: string
          role: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          joined_at?: string | null
          last_access_at?: string | null
          organization_id: string
          role?: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          joined_at?: string | null
          last_access_at?: string | null
          organization_id?: string
          role?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          billing_cycle: Database["public"]["Enums"]["billing_cycle"] | null
          cancel_at_period_end: boolean | null
          certificate_password: string | null
          certificate_path: string | null
          created_at: string
          dedicated_schema: string | null
          description: string | null
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          plan: Database["public"]["Enums"]["organization_plan"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          updated_at: string
        }
        Insert: {
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"] | null
          cancel_at_period_end?: boolean | null
          certificate_password?: string | null
          certificate_path?: string | null
          created_at?: string
          dedicated_schema?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          owner_id: string
          plan?: Database["public"]["Enums"]["organization_plan"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          updated_at?: string
        }
        Update: {
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"] | null
          cancel_at_period_end?: boolean | null
          certificate_password?: string | null
          certificate_path?: string | null
          created_at?: string
          dedicated_schema?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          plan?: Database["public"]["Enums"]["organization_plan"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      planes: {
        Row: {
          created_at: string
          id: string
          max_backrooms: number
          max_salas: number
          nombre: string
        }
        Insert: {
          created_at?: string
          id?: string
          max_backrooms: number
          max_salas: number
          nombre: string
        }
        Update: {
          created_at?: string
          id?: string
          max_backrooms?: number
          max_salas?: number
          nombre?: string
        }
        Relationships: []
      }
      recursos: {
        Row: {
          created_at: string
          id: string
          nombre: string
          sala_id: string
          subido_por: string
          tamano_bytes: number | null
          tipo: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          nombre: string
          sala_id: string
          subido_por: string
          tamano_bytes?: number | null
          tipo: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          nombre?: string
          sala_id?: string
          subido_por?: string
          tamano_bytes?: number | null
          tipo?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "recursos_sala_id_fkey"
            columns: ["sala_id"]
            isOneToOne: false
            referencedRelation: "salas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recursos_subido_por_fkey"
            columns: ["subido_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          id: string
          nombre: string
        }
        Insert: {
          id?: string
          nombre: string
        }
        Update: {
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      sala_permisos: {
        Row: {
          archivos_editar: boolean
          archivos_eliminar: boolean
          archivos_subir: boolean
          created_at: string
          id: string
          sala_id: string
          salas_acceder: boolean
          salas_crear: boolean
          salas_editar: boolean
          salas_eliminar: boolean
          salas_ver: boolean
          updated_at: string
          usuario_id: string
        }
        Insert: {
          archivos_editar?: boolean
          archivos_eliminar?: boolean
          archivos_subir?: boolean
          created_at?: string
          id?: string
          sala_id: string
          salas_acceder?: boolean
          salas_crear?: boolean
          salas_editar?: boolean
          salas_eliminar?: boolean
          salas_ver?: boolean
          updated_at?: string
          usuario_id: string
        }
        Update: {
          archivos_editar?: boolean
          archivos_eliminar?: boolean
          archivos_subir?: boolean
          created_at?: string
          id?: string
          sala_id?: string
          salas_acceder?: boolean
          salas_crear?: boolean
          salas_editar?: boolean
          salas_eliminar?: boolean
          salas_ver?: boolean
          updated_at?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sala_permisos_sala_id_fkey"
            columns: ["sala_id"]
            isOneToOne: false
            referencedRelation: "salas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sala_permisos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      salas: {
        Row: {
          backroom_id: string
          created_at: string
          depth: number
          descripcion: string | null
          icono: string
          id: string
          nombre: string
          parent_id: string | null
        }
        Insert: {
          backroom_id: string
          created_at?: string
          depth?: number
          descripcion?: string | null
          icono?: string
          id?: string
          nombre: string
          parent_id?: string | null
        }
        Update: {
          backroom_id?: string
          created_at?: string
          depth?: number
          descripcion?: string | null
          icono?: string
          id?: string
          nombre?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "salas_backroom_id_fkey"
            columns: ["backroom_id"]
            isOneToOne: false
            referencedRelation: "backrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salas_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "salas"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          activo: boolean
          auth_id: string
          correo: string
          created_at: string
          es_superadmin: boolean
          id: string
          nombre_completo: string
          username: string
        }
        Insert: {
          activo?: boolean
          auth_id: string
          correo: string
          created_at?: string
          es_superadmin?: boolean
          id?: string
          nombre_completo: string
          username: string
        }
        Update: {
          activo?: boolean
          auth_id?: string
          correo?: string
          created_at?: string
          es_superadmin?: boolean
          id?: string
          nombre_completo?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_usuario_id: { Args: never; Returns: string }
      is_backroom_owner: {
        Args: { check_backroom_id: string }
        Returns: boolean
      }
      is_org_member: { Args: { org: string }; Returns: boolean }
      is_org_owner: { Args: { org: string }; Returns: boolean }
    }
    Enums: {
      billing_cycle: "monthly" | "annual"
      organization_plan: "free" | "pro" | "enterprise"
      subscription_status:
        | "incomplete"
        | "incomplete_expired"
        | "trialing"
        | "active"
        | "past_due"
        | "canceled"
        | "unpaid"
        | "paused"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      billing_cycle: ["monthly", "annual"],
      organization_plan: ["free", "pro", "enterprise"],
      subscription_status: [
        "incomplete",
        "incomplete_expired",
        "trialing",
        "active",
        "past_due",
        "canceled",
        "unpaid",
        "paused",
      ],
    },
  },
} as const
