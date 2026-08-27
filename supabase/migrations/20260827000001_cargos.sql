-- Migration: create cargos table
-- Date: 2026-08-27
-- Feature: Flujos de Aprobacion - Cargos

CREATE OR REPLACE FUNCTION public.is_org_admin(org uuid)
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
      AND role = 'admin'
  );
$$;

CREATE TABLE IF NOT EXISTS public.cargos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  nombre varchar(200) NOT NULL,
  descripcion text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cargos_org ON public.cargos(organization_id);

ALTER TABLE public.cargos ENABLE ROW LEVEL SECURITY;

CREATE POLICY cargos_select ON public.cargos FOR SELECT
  USING (is_org_owner(organization_id) OR is_org_member(organization_id));

CREATE POLICY cargos_insert ON public.cargos FOR INSERT
  WITH CHECK (is_org_owner(organization_id) OR is_org_admin(organization_id));

CREATE POLICY cargos_update ON public.cargos FOR UPDATE
  USING (is_org_owner(organization_id) OR is_org_admin(organization_id));

CREATE POLICY cargos_delete ON public.cargos FOR DELETE
  USING (is_org_owner(organization_id) OR is_org_admin(organization_id));
