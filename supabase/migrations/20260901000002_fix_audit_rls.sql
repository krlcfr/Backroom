-- Migration: fix RLS policy for audit_logs
-- Date: 2026-09-01
-- Feature: Auditora (Fix)

DROP POLICY IF EXISTS audit_logs_select_admins ON audit_logs;
DROP POLICY IF EXISTS audit_logs_insert_members ON audit_logs;

-- SELECT: Los administradores y propietarios de la organizacin pueden leer los logs
CREATE POLICY audit_logs_select_admins ON audit_logs FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = (SELECT id FROM usuarios WHERE auth_id = auth.uid()) 
      AND (role = 'admin' OR role = 'Propietario')
    )
  );

-- INSERT: Permitir a los miembros de la organizacin insertar
CREATE POLICY audit_logs_insert_members ON audit_logs FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = (SELECT id FROM usuarios WHERE auth_id = auth.uid())
    )
  );
