-- Migration: update audit_logs to organization level
-- Date: 2026-08-24
-- Feature: Auditoría por Organización

-- Eliminar los logs antiguos ya que estaban ligados a backrooms y el esquema cambió
TRUNCATE TABLE audit_logs;

-- Reemplazar backroom_id por organization_id
ALTER TABLE audit_logs DROP COLUMN backroom_id CASCADE;
ALTER TABLE audit_logs ADD COLUMN organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE;

-- Recrear el índice con la nueva columna
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_id_created_at ON audit_logs(organization_id, created_at DESC);

-- Actualizar las políticas de RLS
DROP POLICY IF EXISTS audit_logs_select_propietario ON audit_logs;
DROP POLICY IF EXISTS audit_logs_insert ON audit_logs;

-- SELECT: Los administradores y propietarios de la organización pueden leer los logs
CREATE POLICY audit_logs_select_admins ON audit_logs FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND (role = 'admin' OR role = 'Propietario')
    )
  );

-- INSERT: Solo el backend a través del service role key o funciones autorizadas deberían insertar,
-- pero por si se necesita desde el cliente, permitimos a los miembros de la org:
CREATE POLICY audit_logs_insert_members ON audit_logs FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );
