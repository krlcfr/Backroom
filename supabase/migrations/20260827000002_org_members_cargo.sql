-- Migration: add cargo_id to organization_members
-- Date: 2026-08-27

ALTER TABLE public.organization_members
ADD COLUMN cargo_id uuid REFERENCES public.cargos(id) ON DELETE SET NULL;
