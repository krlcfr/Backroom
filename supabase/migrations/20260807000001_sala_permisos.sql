-- Migration: create sala_permisos table for granular room permissions
-- Date: 2026-08-07
-- Feature: Matriz de permisos por sala (BE-44 to BE-46)

CREATE TABLE IF NOT EXISTS sala_permisos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sala_id uuid NOT NULL REFERENCES salas(id) ON DELETE CASCADE,
  usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  salas_ver boolean NOT NULL DEFAULT false,
  salas_acceder boolean NOT NULL DEFAULT false,
  archivos_subir boolean NOT NULL DEFAULT false,
  archivos_editar boolean NOT NULL DEFAULT false,
  archivos_eliminar boolean NOT NULL DEFAULT false,
  salas_crear boolean NOT NULL DEFAULT false,
  salas_editar boolean NOT NULL DEFAULT false,
  salas_eliminar boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT idx_sala_usuario UNIQUE (sala_id, usuario_id)
);

CREATE INDEX IF NOT EXISTS idx_sala_permisos_sala_id ON sala_permisos(sala_id);
CREATE INDEX IF NOT EXISTS idx_sala_permisos_usuario_id ON sala_permisos(usuario_id);

-- Habilitar RLS
ALTER TABLE sala_permisos ENABLE ROW LEVEL SECURITY;

-- SELECT: Los miembros del backroom pueden ver los permisos de las salas de su backroom
CREATE POLICY sala_permisos_select ON sala_permisos FOR SELECT
  USING (
    sala_id IN (
      SELECT s.id FROM salas s WHERE s.backroom_id IN (
        SELECT bm.backroom_id FROM backroom_miembros bm WHERE bm.usuario_id = (SELECT id FROM usuarios WHERE auth_id = auth.uid())
      ) UNION
      SELECT s.id FROM salas s WHERE s.backroom_id IN (
        SELECT id FROM backrooms WHERE propietario_id = (SELECT id FROM usuarios WHERE auth_id = auth.uid())
      )
    )
  );

-- INSERT/UPDATE/DELETE: Solo el propietario (o administradores en el futuro) del backroom puede modificar los permisos
CREATE POLICY sala_permisos_modify ON sala_permisos FOR ALL
  USING (
    sala_id IN (
      SELECT s.id FROM salas s WHERE s.backroom_id IN (
        SELECT id FROM backrooms WHERE propietario_id = (SELECT id FROM usuarios WHERE auth_id = auth.uid())
      )
    )
  );
