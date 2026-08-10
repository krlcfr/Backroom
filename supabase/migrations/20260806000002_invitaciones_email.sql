-- Migration: add email column to invitaciones table
-- Date: 2026-08-06
-- Feature: invite members by email (BE-49)

ALTER TABLE invitaciones
  ADD COLUMN IF NOT EXISTS email varchar(255) NOT NULL DEFAULT '';

-- Index for lookups by email
CREATE INDEX IF NOT EXISTS idx_invitaciones_email ON invitaciones(email);
CREATE INDEX IF NOT EXISTS idx_invitaciones_link_token ON invitaciones(link_token);
CREATE INDEX IF NOT EXISTS idx_invitaciones_backroom_activa ON invitaciones(backroom_id, activa);
