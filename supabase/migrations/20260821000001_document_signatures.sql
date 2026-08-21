-- Migration: Add document_signatures table and cert policies
-- Date: 2026-08-21
-- Feature: Editor PDF y Firmas (M-12)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE document_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recurso_id UUID NOT NULL REFERENCES recursos(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    signature_image_url TEXT NOT NULL,
    page_number INTEGER NOT NULL,
    pos_x FLOAT NOT NULL,
    pos_y FLOAT NOT NULL,
    width FLOAT NOT NULL,
    height FLOAT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_document_signatures_recurso ON document_signatures(recurso_id);
CREATE INDEX idx_document_signatures_usuario ON document_signatures(usuario_id);

ALTER TABLE document_signatures ENABLE ROW LEVEL SECURITY;

-- SELECT: Los dueños del Backroom pueden ver TODAS las firmas de sus recursos.
-- Los miembros normales solo pueden ver SUS propias firmas.
CREATE POLICY doc_sig_select_owner ON document_signatures
  FOR SELECT
  USING (
    recurso_id IN (
      SELECT r.id FROM recursos r
      JOIN salas s ON r.sala_id = s.id
      JOIN backrooms b ON s.backroom_id = b.id
      WHERE b.propietario_id = (SELECT id FROM usuarios WHERE auth_id = auth.uid())
    )
    OR
    usuario_id = (SELECT id FROM usuarios WHERE auth_id = auth.uid())
  );

-- INSERT: Cualquiera puede insertar su propia firma.
CREATE POLICY doc_sig_insert_self ON document_signatures
  FOR INSERT
  WITH CHECK (
    usuario_id = (SELECT id FROM usuarios WHERE auth_id = auth.uid())
  );

-- DELETE: Solo el usuario o el dueño del backroom pueden borrar.
CREATE POLICY doc_sig_delete_self_or_owner ON document_signatures
  FOR DELETE
  USING (
    usuario_id = (SELECT id FROM usuarios WHERE auth_id = auth.uid())
    OR
    recurso_id IN (
      SELECT r.id FROM recursos r
      JOIN salas s ON r.sala_id = s.id
      JOIN backrooms b ON s.backroom_id = b.id
      WHERE b.propietario_id = (SELECT id FROM usuarios WHERE auth_id = auth.uid())
    )
  );

-- Añadir campos para el Certificado Criptográfico a la organización (Planes Pro/Enterprise)
ALTER TABLE organizations
  ADD COLUMN certificate_path TEXT,
  ADD COLUMN certificate_password TEXT; -- In a real app this should be symmetrically encrypted
