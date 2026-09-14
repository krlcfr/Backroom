-- Fix RLS policy for recursos insert to include the owner

DROP POLICY IF EXISTS recursos_insert_member ON recursos;

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
      UNION
      SELECT s.id FROM salas s
      WHERE s.backroom_id IN (
        SELECT id FROM backrooms
        WHERE propietario_id = (SELECT id FROM usuarios WHERE auth_id = auth.uid())
      )
    )
  );
