import { createClient } from "@/lib/supabase/server";
import { ApiError } from "@/lib/api-error";

export interface WorkflowNodeData {
  id: string; // id del nodo de react flow
  cargo_id: string;
  assigned_user_id?: string;
  node_type: 'linear' | 'parallel' | 'final';
  action_required: 'sign' | 'approve' | 'review';
}

export interface WorkflowInput {
  organization_id: string;
  document_id: string;
  title: string;
  flow_graph_json: {
    nodes: any[];
    edges: any[];
  };
  // Este array simplificado representa el orden.
  // En un sistema real se calcularía un orden topológico (step_order) desde los edges.
  parsed_nodes: WorkflowNodeData[];
}

export class WorkflowsService {
  /**
   * Crea un workflow e inserta sus nodos
   */
  static async createWorkflow(input: WorkflowInput) {
    const supabase = await createClient();
    
    // Obtenemos el usuario actual
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new ApiError(401, "No autorizado");

    // 1. Crear el Workflow
    const { data: workflow, error: wfError } = await supabase
      .from("document_workflows")
      .insert({
        organization_id: input.organization_id,
        document_id: input.document_id,
        created_by: user.id,
        title: input.title,
        status: 'draft',
        flow_graph_json: input.flow_graph_json
      })
      .select()
      .single();

    if (wfError) {
      throw new ApiError(500, `Error al crear workflow: ${wfError.message}`);
    }

    // 2. Insertar los Nodos (Asumiendo que parsed_nodes viene ordenado o le asignamos un índice)
    const nodesToInsert = input.parsed_nodes.map((n, index) => ({
      workflow_id: workflow.id,
      cargo_id: n.cargo_id,
      assigned_user_id: n.assigned_user_id || null,
      step_order: index + 1, // orden secuencial temporal
      node_type: n.node_type,
      action_required: n.action_required,
      status: 'pending'
    }));

    if (nodesToInsert.length > 0) {
      const { error: nodesError } = await supabase
        .from("workflow_nodes")
        .insert(nodesToInsert);
        
      if (nodesError) {
        // En un caso ideal se haría un rollback (o RPC de BD), aquí lanzamos el error
      throw new ApiError(500, `Error al guardar nodos del flujo: ${nodesError.message}`);
      }
    }

    return workflow;
  }
}
