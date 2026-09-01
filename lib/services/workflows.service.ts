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
   * (con rollback manual en caso de error en los nodos)
   */
  static async createWorkflow(input: WorkflowInput) {
    const supabase = await createClient();
    
    // Obtenemos el usuario actual
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new ApiError(401, "No autorizado");

    // Para obtener el nombre del usuario (para notificaciones)
    const { data: userProfile } = await supabase
      .from('usuarios')
      .select('id, nombre_completo')
      .eq('auth_id', user.id)
      .single();
    const creatorName = userProfile?.nombre_completo || 'Un usuario';

    // Para obtener el título del documento
    const { data: docData } = await supabase
      .from('recursos')
      .select('nombre')
      .eq('id', input.document_id)
      .single();
    const documentTitle = docData?.nombre || 'Documento sin título';

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

    // 2. Insertar los Nodos
    const nodesToInsert = input.nodes.map((n) => ({
      workflow_id: workflow.id,
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
        throw new ApiError(500, `Error al guardar nodos del flujo: ${nodesError.message}`);
      }
    }

    // 3. Registrar en Auditoría
    await AuditService.logAction({
      orgId: input.organization_id,
      actorId: userProfile ? userProfile.id : user.id, // we might need internal ID, usually authId != internal Id in Backroom. Wait, logAction uses actor_id = usuarios.id.
      action: "WORKFLOW_CREATED",
      targetType: "workflow",
      targetId: workflow.id,
      details: {
        title: input.title,
        document_id: input.document_id,
        total_steps: input.nodes.length
      }
    });

    // 4. Enviar notificaciones al Paso 1
    const firstStepNodes = input.nodes.filter(n => n.step_order === 1);
    const assignedUserIds = firstStepNodes.map(n => n.assigned_user_id).filter(Boolean) as string[];
    const cargoIds = firstStepNodes.map(n => n.cargo_id).filter(Boolean);

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

  static async getWorkflowByDocument(documentId: string) {
    const supabase = await createClient();
    const { data: workflow, error } = await supabase
      .from('document_workflows')
      .select(`
        *,
        nodes:workflow_nodes(
          *,
          cargo:cargos(nombre),
          assigned_user:usuarios!workflow_nodes_assigned_user_id_fkey(nombre_completo, correo)
        )
      `)
      .eq('document_id', documentId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is not found
      throw new ApiError(500, `Error fetching workflow: ${error.message}`);
    }

    return workflow;
  }
}
