-- Migration: create audit_logs table
-- Date: 2026-08-07
-- Feature: Auditoría por BackRoom (BE-50 to BE-52)

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  backroom_id uuid NOT NULL REFERENCES backrooms(id) ON DELETE CASCADE,
  actor_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id uuid,
  details jsonb,
  ip_address text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Índices para búsquedas rápidas en el historial
CREATE INDEX IF NOT EXISTS idx_audit_logs_backroom_id_created_at ON audit_logs(backroom_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON audit_logs(target_type, target_id);

-- Habilitar RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- SELECT: Solo el propietario del backroom puede leer los logs
CREATE POLICY audit_logs_select_propietario ON audit_logs FOR SELECT
  USING (
    backroom_id IN (
      SELECT id FROM backrooms WHERE propietario_id = (SELECT id FROM usuarios WHERE auth_id = auth.uid())
    )
  );

-- INSERT: Cualquiera (que tenga acceso) puede generar logs a través del API
-- Para mayor seguridad, podríamos restringir a los miembros del backroom
CREATE POLICY audit_logs_insert ON audit_logs FOR INSERT
  WITH CHECK (
    backroom_id IN (
      SELECT backroom_id FROM backroom_miembros WHERE usuario_id = (SELECT id FROM usuarios WHERE auth_id = auth.uid())
      UNION
      SELECT id FROM backrooms WHERE propietario_id = (SELECT id FROM usuarios WHERE auth_id = auth.uid())
    )
  );

-- No hay políticas para UPDATE o DELETE (los logs de auditoría son inmutables)
