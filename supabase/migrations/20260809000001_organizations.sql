-- Migration: create organizations and organization_members tables
-- Date: 2026-08-09
-- Feature: Crear organización (autoservicio) — M-03, BE-15 (v8.0)
-- Model: organizations (owner_id), organization_members (roles fijos admin|member, RN-01/R-09/RN-06)

-- ============================================================
-- ORGANIZATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES usuarios(id),
  name varchar(200) NOT NULL,
  description text,
  logo_url varchar(500),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON organizations(owner_id);

-- ============================================================
-- ORGANIZATION_MEMBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  role varchar(20) NOT NULL DEFAULT 'member' CHECK (role IN ('admin','member')),
  status varchar(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('active','pending')),
  joined_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT uq_organization_member UNIQUE (organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);

-- ============================================================
-- RLS — ORGANIZATIONS
-- ============================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- SELECT: el propietario o un miembro activo de la organización
CREATE POLICY organizations_select ON organizations FOR SELECT
  USING (
    owner_id = (SELECT id FROM usuarios WHERE auth_id = auth.uid())
    OR
    id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = (SELECT id FROM usuarios WHERE auth_id = auth.uid())
        AND status = 'active'
    )
  );

-- INSERT: solo el creador (el Propietario, RN-01)
CREATE POLICY organizations_insert ON organizations FOR INSERT
  WITH CHECK (owner_id = (SELECT id FROM usuarios WHERE auth_id = auth.uid()));

-- UPDATE/DELETE: solo el Propietario
CREATE POLICY organizations_update_owner ON organizations FOR UPDATE
  USING (owner_id = (SELECT id FROM usuarios WHERE auth_id = auth.uid()));

CREATE POLICY organizations_delete_owner ON organizations FOR DELETE
  USING (owner_id = (SELECT id FROM usuarios WHERE auth_id = auth.uid()));

-- ============================================================
-- RLS — ORGANIZATION_MEMBERS
-- ============================================================
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- SELECT: propietario o miembro activo de la organización
CREATE POLICY org_members_select ON organization_members FOR SELECT
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_id = (SELECT id FROM usuarios WHERE auth_id = auth.uid())
    )
    OR
    user_id = (SELECT id FROM usuarios WHERE auth_id = auth.uid())
  );

-- INSERT: solo Propietario (o miembro activo) de la organización
CREATE POLICY org_members_insert ON organization_members FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_id = (SELECT id FROM usuarios WHERE auth_id = auth.uid())
    )
    OR
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = (SELECT id FROM usuarios WHERE auth_id = auth.uid())
        AND status = 'active'
    )
  );

-- UPDATE/DELETE: solo el Propietario (R-09)
CREATE POLICY org_members_update_owner ON organization_members FOR UPDATE
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_id = (SELECT id FROM usuarios WHERE auth_id = auth.uid())
    )
  );

CREATE POLICY org_members_delete_owner ON organization_members FOR DELETE
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_id = (SELECT id FROM usuarios WHERE auth_id = auth.uid())
    )
  );

-- ============================================================
-- STORAGE — BUCKET org-logos (logo de organización, público)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('org-logos', 'org-logos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "org_logos_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'org-logos');

CREATE POLICY "org_logos_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'org-logos' AND auth.role() = 'authenticated');

CREATE POLICY "org_logos_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'org-logos' AND auth.role() = 'authenticated');
