-- Migration: Fix RLS para recursos vinculados a flujos (TC-05/TC-06)
-- Feature: Asegurar que los miembros asignados a firmar puedan ver el documento

-- Permite ver un recurso si el usuario está directamente asignado en un nodo del flujo 
-- (ya sea por su user_id de auth o por su cargo dentro de la organización)
CREATE POLICY recursos_select_workflow_assigned ON public.recursos
  FOR SELECT
  USING (
    id IN (
      SELECT dw.document_id 
      FROM public.document_workflows dw
      JOIN public.workflow_nodes wn ON wn.workflow_id = dw.id
      WHERE wn.assigned_user_id = auth.uid()
         OR (
           wn.cargo_id IS NOT NULL AND wn.cargo_id IN (
             SELECT om.cargo_id 
             FROM public.organization_members om
             JOIN public.usuarios u ON u.id = om.user_id
             WHERE u.auth_id = auth.uid() 
               AND om.organization_id = dw.organization_id
           )
         )
    )
  );
