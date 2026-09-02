-- Migration: Add PKI columns to document_signatures
-- Date: 2026-09-01

ALTER TABLE public.document_signatures 
ADD COLUMN IF NOT EXISTS signature_hash TEXT,
ADD COLUMN IF NOT EXISTS certificate_serial TEXT,
ADD COLUMN IF NOT EXISTS signed_content_hash TEXT,
ADD COLUMN IF NOT EXISTS is_pki BOOLEAN DEFAULT false,
-- Hacer opcionales los campos visuales si es una firma puramente digital
ALTER COLUMN height DROP NOT NULL,
ALTER COLUMN width DROP NOT NULL,
ALTER COLUMN pos_x DROP NOT NULL,
ALTER COLUMN pos_y DROP NOT NULL,
ALTER COLUMN page_number DROP NOT NULL,
ALTER COLUMN signature_image_url DROP NOT NULL;
