-- Migration: enable RLS and add policies for recursos and invitaciones
-- Date: 2026-08-06
-- Feature: security policies for resources and invitations (BE-40 to BE-43, BE-49 to BE-52)

-- ============================================================
-- RECURSOS
-- ============================================================
ALTER TABLE recursos ENABLE ROW LEVEL SECURITY;

-- SELECT: miembros del backroom al que pertenece la sala
CREATE POLICY recursos_select_member ON recursos
  FOR SELECT
  USING (
    sala_id IN (
      SELECT s.id FROM salas s
      WHERE s.backroom_id IN (
        SELECT bm.backroom_id FROM backroom_miembros bm
        WHERE bm.usuario_id = (
          SELECT id FROM usuarios WHERE auth_id = auth.uid()
        )
      )
      UNION
      SELECT s.id FROM salas s
      WHERE s.backroom_id IN (
        SELECT id FROM backrooms
        WHERE propietario_id = (
          SELECT id FROM usuarios WHERE auth_id = auth.uid()
        )
      )
    )
  );

-- INSERT: miembros con permiso 'contribuir'
CREATE POLICY recursos_insert_member ON recursos
  FOR INSERT
  WITH CHECK (
    sala_id IN (
      SELECT s.id FROM salas s
      WHERE s.backroom_id IN (
        SELECT bm.backroom_id FROM backroom_miembros bm
        WHERE bm.usuario_id = (SELECT id FROM usuarios WHERE auth_id = auth.uid())
          AND bm.permiso = 'contribuir'
      )
    )
  );

-- DELETE: solo quien subió el recurso o el propietario del backroom
CREATE POLICY recursos_delete_own ON recursos
  FOR DELETE
  USING (
    subido_por = (SELECT id FROM usuarios WHERE auth_id = auth.uid())
    OR
    sala_id IN (
      SELECT s.id FROM salas s
      WHERE s.backroom_id IN (
        SELECT id FROM backrooms
        WHERE propietario_id = (SELECT id FROM usuarios WHERE auth_id = auth.uid())
      )
    )
  );

-- ============================================================
-- INVITACIONES
-- ============================================================
ALTER TABLE invitaciones ENABLE ROW LEVEL SECURITY;

-- SELECT: el propietario del backroom puede ver sus invitaciones
CREATE POLICY invitaciones_select_owner ON invitaciones
  FOR SELECT
  USING (
    is_backroom_owner(backroom_id)
    OR
    creado_por = (SELECT id FROM usuarios WHERE auth_id = auth.uid())
  );

-- INSERT: solo propietarios
CREATE POLICY invitaciones_insert_owner ON invitaciones
  FOR INSERT
  WITH CHECK (is_backroom_owner(backroom_id));

-- UPDATE: solo propietarios (para revocar)
CREATE POLICY invitaciones_update_owner ON invitaciones
  FOR UPDATE
  USING (is_backroom_owner(backroom_id));
