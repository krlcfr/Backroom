-- Migration: fix RLS infinite recursion on organizations / organization_members
-- Date: 2026-08-09
-- Issue: policies referenced each other via subqueries (42P17) → POST /api/organizations 500
-- Fix: SECURITY DEFINER helpers bypass RLS and break the circular reference.

-- ============================================================
-- 1) DROP las policies rotas
-- ============================================================
DROP POLICY IF EXISTS organizations_select ON organizations;
DROP POLICY IF EXISTS organizations_insert ON organizations;
DROP POLICY IF EXISTS organizations_update_owner ON organizations;
DROP POLICY IF EXISTS organizations_delete_owner ON organizations;
DROP POLICY IF EXISTS org_members_select ON organization_members;
DROP POLICY IF EXISTS org_members_insert ON organization_members;
DROP POLICY IF EXISTS org_members_update_owner ON organization_members;
DROP POLICY IF EXISTS org_members_delete_owner ON organization_members;

-- ============================================================
-- 2) Funciones helper (SECURITY DEFINER → evitan recursión de RLS)
-- ============================================================
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

-- ============================================================
-- 3) Policies corregidas (sin subqueries sujetas a RLS)
-- ============================================================

-- ORGANIZATIONS
CREATE POLICY organizations_select ON organizations FOR SELECT
  USING (owner_id = current_usuario_id() OR is_org_member(id));

CREATE POLICY organizations_insert ON organizations FOR INSERT
  WITH CHECK (owner_id = current_usuario_id());

CREATE POLICY organizations_update_owner ON organizations FOR UPDATE
  USING (owner_id = current_usuario_id());

CREATE POLICY organizations_delete_owner ON organizations FOR DELETE
  USING (owner_id = current_usuario_id());

-- ORGANIZATION_MEMBERS
CREATE POLICY org_members_select ON organization_members FOR SELECT
  USING (
    is_org_owner(organization_id)
    OR is_org_member(organization_id)
    OR user_id = current_usuario_id()
  );

CREATE POLICY org_members_insert ON organization_members FOR INSERT
  WITH CHECK (is_org_owner(organization_id));

CREATE POLICY org_members_update_owner ON organization_members FOR UPDATE
  USING (is_org_owner(organization_id));

CREATE POLICY org_members_delete_owner ON organization_members FOR DELETE
  USING (is_org_owner(organization_id));
