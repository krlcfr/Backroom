import { createClient } from "@/lib/supabase/server";
import { ApiError } from "@/lib/api-error";
import { AuditService } from "@/lib/services/audit.service";
import { NotificationService } from "@/lib/services/notification.service";
import { ParsedNode } from "@/lib/utils/workflow-graph-parser";

export interface WorkflowInput {
  organization_id: string;
  document_id: string;
  title: string;
  flow_graph_json: any;
  nodes: ParsedNode[];
}

export class WorkflowsService {
  /**
   * Crea un workflow e inserta sus nodos de forma "transaccional"
   */
  static async createWorkflow(input: WorkflowInput) {
    const supabase = await createClient();
    
    // Obtenemos el usuario actual
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new ApiError(401, "No autorizado");

    const { data: userProfile } = await supabase
      .from('usuarios')
      .select('id, nombre_completo')
      .eq('auth_id', user.id)
      .single();

    const creatorName = userProfile?.nombre_completo || 'Un miembro';

    // Para la notificación por correo necesitamos el título del documento
    const { data: document } = await supabase
      .from('resources')
      .select('name')
      .eq('id', input.document_id)
      .single();
    
    const documentTitle = document?.name || input.title;

    // 1. Insertar Workflow principal
    const { data: workflow, error: wfError } = await supabase
      .from("document_workflows")
      .insert({
        organization_id: input.organization_id,
        document_id: input.document_id,
        title: input.title,
        status: 'pending',
        flow_graph_json: input.flow_graph_json
      })
      .select()
      .single();

    if (wfError) throw new ApiError(500, "Error al crear el flujo de trabajo: " + wfError.message);

    // 2. Insertar los nodos (pasos)
    const nodesToInsert = input.nodes.map(n => ({
      workflow_id: workflow.id,
      react_flow_id: n.reactFlowId,
      cargo_id: n.cargo_id,
      assigned_user_id: n.assigned_user_id || null,
      step_order: n.step_order,
      node_type: n.node_type,
      action_required: n.action_required,
      status: 'pending'
    }));

    if (nodesToInsert.length > 0) {
      const { error: nodesError } = await supabase
        .from("workflow_nodes")
        .insert(nodesToInsert);
        
      if (nodesError) {
        // Rollback manual
        await supabase.from("document_workflows").delete().eq("id", workflow.id);
        throw new ApiError(500, "Error al guardar nodos del flujo: " + nodesError.message);
      }
    }

    // 3. Registrar en Auditoría
    await AuditService.logAction({
      orgId: input.organization_id,
      actorId: user.id,
      action: "WORKFLOW_CREATED",
      targetType: "workflow",
      targetId: input.document_id, // Usamos el ID del documento para que quede ligado a él
      details: { workflow_id: workflow.id, title: input.title }
    });

    // 4. Enviar notificaciones al Paso 1
    const firstStepNodes = input.nodes.filter(n => n.step_order === 1);
    const assignedUserIds = firstStepNodes.map(n => n.assigned_user_id).filter(Boolean) as string[];
    
    let emailsToNotify: string[] = [];

    // Si hay usuarios asignados directamente
    if (assignedUserIds.length > 0) {
      const { data: users } = await supabase
        .from('usuarios')
        .select('correo')
        .in('id', assignedUserIds);
      if (users) {
        emailsToNotify.push(...users.map(u => u.correo));
      }
    }

    // Si hay cargos sin usuario asignado, notificar a todos los miembros con ese cargo
    const cargosWithoutUser = firstStepNodes.filter(n => !n.assigned_user_id).map(n => n.cargo_id);
    if (cargosWithoutUser.length > 0) {
      const { data: members } = await supabase
        .from('organization_members')
        .select('user_id, usuarios!organization_members_user_id_fkey(correo)')
        .eq('organization_id', input.organization_id)
        .in('cargo_id', cargosWithoutUser);
      
      if (members) {
        members.forEach(m => {
          // @ts-ignore
          if (m.usuarios && m.usuarios.correo) {
            // @ts-ignore
            emailsToNotify.push(m.usuarios.correo);
          }
        });
      }
    }

    // Deduplicate emails
    emailsToNotify = [...new Set(emailsToNotify)];

    if (emailsToNotify.length > 0) {
      await NotificationService.notifyWorkflowAssigned({
        workflowTitle: input.title,
        documentTitle: documentTitle,
        recipientEmails: emailsToNotify,
        actionRequired: firstStepNodes[0].action_required, // Simplification
        creatorName: creatorName
      });
    }

    return workflow;
  }

  /**
   * Obtiene el workflow de un documento con sus nodos
   */
  static async getWorkflowByDocument(documentId: string) {
    const supabase = await createClient();
    const { data: workflow, error } = await supabase
      .from("document_workflows")
      .select(\
        *,
        nodes:workflow_nodes(
          *,
          cargo:cargos(nombre),
          assigned_user:usuarios!workflow_nodes_assigned_user_id_fkey(nombre_completo, correo)
        )
      \)
      .eq("document_id", documentId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new ApiError(500, "Error al obtener el workflow: " + error.message);
    }
    return workflow;
  }

  /**
   * Aprueba o rechaza un nodo del flujo y ejecuta el "efecto dominó"
   */
  static async approveNode(workflowId: string, nodeId: string, action: 'approved' | 'rejected') {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, "No autorizado");

    // 0. Obtener el workflow para saber el documento y la organización (para auditoría)
    const { data: workflow, error: wfError } = await supabase
      .from("document_workflows")
      .select("organization_id, document_id")
      .eq("id", workflowId)
      .single();
    
    if (wfError || !workflow) throw new ApiError(404, "Workflow no encontrado");

    // 1. Actualizar el estado del nodo actual
    const { data: updatedNode, error: updateError } = await supabase
      .from("workflow_nodes")
      .update({ status: action })
      .eq("id", nodeId)
      .eq("workflow_id", workflowId)
      .select()
      .single();

    if (updateError) throw new ApiError(500, "Error al actualizar nodo: " + updateError.message);

    // Registrar en Auditoría
    await AuditService.logAction({
      orgId: workflow.organization_id,
      actorId: user.id,
      action: action === 'approved' ? 'WORKFLOW_STEP_APPROVED' : 'WORKFLOW_REJECTED',
      targetType: 'workflow',
      targetId: workflow.document_id,
      details: { workflow_id: workflowId, node_id: nodeId, step_order: updatedNode.step_order }
    });

    // Si fue rechazado, se marca todo el workflow como rechazado.
    if (action === 'rejected') {
       await supabase.from("document_workflows").update({ status: 'rejected' }).eq("id", workflowId);
       return { success: true, nextStep: null, workflowStatus: 'rejected' };
    }

    // 2. Obtener todos los nodos del flujo para analizar el "efecto dominó"
    const { data: allNodes, error: nodesError } = await supabase
      .from("workflow_nodes")
      .select("*")
      .eq("workflow_id", workflowId)
      .order("step_order", { ascending: true });

    if (nodesError) throw new ApiError(500, "Error al obtener nodos del flujo");

    const currentOrder = updatedNode.step_order;

    // 3. Revisar si quedan nodos paralelos pendientes en el MISMO step_order
    const pendingSiblings = allNodes.filter(n => n.step_order === currentOrder && n.status !== 'approved');

    if (pendingSiblings.length === 0) {
      // Todos los de este nivel aprobaron. Activar el siguiente paso.
      const nextOrder = currentOrder + 1;
      const nextNodes = allNodes.filter(n => n.step_order === nextOrder);

      if (nextNodes.length > 0) {
        // En una implementación robusta, los nodos futuros deberían estar en estado 'waiting',
        // y aquí los pasaríamos a 'pending'. Actualmente se disparan las notificaciones.
        await NotificationService.notifyNextStep(workflowId, nextNodes);
        
        await supabase.from("document_workflows").update({ status: 'in_progress' }).eq("id", workflowId);
        return { success: true, nextStep: nextOrder, workflowStatus: 'in_progress' };
      } else {
        // No hay más pasos. Flujo completado.
        await supabase.from("document_workflows").update({ status: 'completed' }).eq("id", workflowId);
        return { success: true, nextStep: null, workflowStatus: 'completed' };
      }
    }

    return { success: true, nextStep: currentOrder, workflowStatus: 'in_progress' };
  }
}
