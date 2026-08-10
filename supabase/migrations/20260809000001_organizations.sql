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

-- Funciones helper (SECURITY DEFINER → evitan recursión circular de RLS)
CREATE OR REPLACE FUNCTION public.current_usuario_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM usuarios WHERE auth_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_org_member(org uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = org
      AND user_id = current_usuario_id()
      AND status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_org_owner(org uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM organizations
    WHERE id = org
      AND owner_id = current_usuario_id()
  );
$$;

-- SELECT: el propietario o un miembro activo de la organización
CREATE POLICY organizations_select ON organizations FOR SELECT
  USING (owner_id = current_usuario_id() OR is_org_member(id));

-- INSERT: solo el creador (el Propietario, RN-01)
CREATE POLICY organizations_insert ON organizations FOR INSERT
  WITH CHECK (owner_id = current_usuario_id());

-- UPDATE/DELETE: solo el Propietario
CREATE POLICY organizations_update_owner ON organizations FOR UPDATE
  USING (owner_id = current_usuario_id());

CREATE POLICY organizations_delete_owner ON organizations FOR DELETE
  USING (owner_id = current_usuario_id());

-- ============================================================
-- RLS — ORGANIZATION_MEMBERS
-- ============================================================
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- SELECT: propietario, miembro activo de la organización o el propio usuario
CREATE POLICY org_members_select ON organization_members FOR SELECT
  USING (
    is_org_owner(organization_id)
    OR is_org_member(organization_id)
    OR user_id = current_usuario_id()
  );

-- INSERT: solo el Propietario
CREATE POLICY org_members_insert ON organization_members FOR INSERT
  WITH CHECK (is_org_owner(organization_id));

-- UPDATE/DELETE: solo el Propietario (R-09)
CREATE POLICY org_members_update_owner ON organization_members FOR UPDATE
  USING (is_org_owner(organization_id));

CREATE POLICY org_members_delete_owner ON organization_members FOR DELETE
  USING (is_org_owner(organization_id));

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
