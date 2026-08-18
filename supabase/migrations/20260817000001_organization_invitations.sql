-- Migration: organization_invitations
-- Date: 2026-08-17
-- Feature: RBAC and Invitations for Organizations

-- ============================================================
-- ORGANIZATION_INVITATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS organization_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  email varchar(255) NOT NULL,
  role varchar(20) NOT NULL DEFAULT 'member' CHECK (role IN ('admin','member')),
  token varchar(64) NOT NULL UNIQUE,
  status varchar(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_org_invitations_org ON organization_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_invitations_email ON organization_invitations(email);
CREATE INDEX IF NOT EXISTS idx_org_invitations_token ON organization_invitations(token);

-- ============================================================
-- RLS — ORGANIZATION_INVITATIONS
-- ============================================================
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;

-- SELECT: el propietario, miembros de la organización, o el propio usuario invitado (por email)
CREATE POLICY org_invitations_select ON organization_invitations FOR SELECT
  USING (
    is_org_owner(organization_id)
    OR is_org_member(organization_id)
  );

-- INSERT: solo el Propietario o administradores de la organización
CREATE POLICY org_invitations_insert ON organization_invitations FOR INSERT
  WITH CHECK (
    is_org_owner(organization_id)
    OR EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organization_invitations.organization_id
        AND user_id = current_usuario_id()
        AND role = 'admin'
        AND status = 'active'
    )
  );

-- UPDATE/DELETE: solo Propietarios o Administradores
CREATE POLICY org_invitations_update ON organization_invitations FOR UPDATE
  USING (
    is_org_owner(organization_id)
    OR EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organization_invitations.organization_id
        AND user_id = current_usuario_id()
        AND role = 'admin'
        AND status = 'active'
    )
  );

CREATE POLICY org_invitations_delete ON organization_invitations FOR DELETE
  USING (
    is_org_owner(organization_id)
    OR EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organization_invitations.organization_id
        AND user_id = current_usuario_id()
        AND role = 'admin'
        AND status = 'active'
    )
  );
