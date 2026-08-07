-- Migration: add parent_id and depth to salas for recursive tree support
-- Date: 2026-08-06
-- Feature: sala tree structure (BE-33 to BE-39)

ALTER TABLE salas
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES salas(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS depth integer NOT NULL DEFAULT 0;

-- Index for efficient parent lookups
CREATE INDEX IF NOT EXISTS idx_salas_parent_id ON salas(parent_id);
CREATE INDEX IF NOT EXISTS idx_salas_backroom_id ON salas(backroom_id);
