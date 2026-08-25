-- Drop old insert policy
DROP POLICY IF EXISTS doc_sig_insert_self_or_owner ON document_signatures;

-- New INSERT policy: A user can insert their own signature, OR the owner of the backroom can insert a signature placeholder for anyone, OR the creator of the resource can insert placeholders.
CREATE POLICY doc_sig_insert_self_or_owner_or_creator ON document_signatures
  FOR INSERT
  WITH CHECK (
    usuario_id = (SELECT id FROM usuarios WHERE auth_id = auth.uid())
    OR
    recurso_id IN (
      SELECT r.id FROM recursos r
      JOIN salas s ON r.sala_id = s.id
      JOIN backrooms b ON s.backroom_id = b.id
      WHERE b.propietario_id = (SELECT id FROM usuarios WHERE auth_id = auth.uid())
      OR r.usuario_id = (SELECT id FROM usuarios WHERE auth_id = auth.uid())
    )
  );

