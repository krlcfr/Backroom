-- Migration: add last_access_at and updated_at to organization_members
-- Date: 2026-08-12
-- Feature: Gestión de miembros (UI-09) — M-03, BE-19 (v8.0)
-- Model: organization_members (último acceso del miembro)

ALTER TABLE organization_members
  ADD COLUMN IF NOT EXISTS last_access_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone;
