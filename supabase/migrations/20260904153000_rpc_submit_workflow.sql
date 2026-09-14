-- Migration: 013_rpc_submit_workflow
-- Description: RPC para ejecutar transaccionalmente el envío de un flujo (TC-02)

CREATE OR REPLACE FUNCTION public.submit_workflow_transaction(
    p_workflow_id UUID,
    p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_workflow RECORD;
    v_updated_nodes INT;
    v_first_node_users JSONB;
BEGIN
    -- 1. Obtener y bloquear el workflow
    SELECT * INTO v_workflow 
    FROM public.document_workflows 
    WHERE id = p_workflow_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Workflow no encontrado');
    END IF;

    IF v_workflow.status != 'draft' THEN
        RETURN jsonb_build_object('success', false, 'error', 'El workflow no está en estado draft');
    END IF;

    -- Validar que la cantidad de firmas requeridas esté posicionada
    IF v_workflow.placed_signatures_count < v_workflow.total_signers_count THEN
        RETURN jsonb_build_object('success', false, 'error', 'Faltan firmas por posicionar en el lienzo');
    END IF;

    -- 2. Actualizar el estado del workflow
    UPDATE public.document_workflows
    SET status = 'in_progress', updated_at = NOW()
    WHERE id = p_workflow_id;

    -- 3. Activar los nodos del primer paso (step_order = 1)
    UPDATE public.workflow_nodes
    SET status = 'in_turn'
    WHERE workflow_id = p_workflow_id AND step_order = 1;

    GET DIAGNOSTICS v_updated_nodes = ROW_COUNT;

    IF v_updated_nodes = 0 THEN
        -- Si no hay nodos de paso 1, algo está mal, hacemos rollback (por exception)
        RAISE EXCEPTION 'No se encontraron nodos en el paso 1 para activar';
    END IF;

    -- 4. Obtener los usuarios del primer paso para notificar (si están asignados)
    SELECT jsonb_agg(
        jsonb_build_object(
            'node_id', id,
            'assigned_user_id', assigned_user_id,
            'cargo_id', cargo_id
        )
    ) INTO v_first_node_users
    FROM public.workflow_nodes
    WHERE workflow_id = p_workflow_id AND step_order = 1;

    RETURN jsonb_build_object(
        'success', true,
        'workflow_id', p_workflow_id,
        'first_node_users', COALESCE(v_first_node_users, '[]'::jsonb)
    );
END;
$$;
