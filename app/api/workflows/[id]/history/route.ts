import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/session";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: workflowId } = await params;

    // Usamos el cliente admin para hacer join con auth.users o buscar los perfiles
    const supabaseAdmin = createAdminClient();

    // 1. Obtener las acciones del flujo
    const { data: actions, error } = await supabaseAdmin
      .from("workflow_actions")
      .select(`
        id,
        action,
        rejection_reason,
        comments,
        created_at,
        user_id,
        node_id
      `)
      .eq("workflow_id", workflowId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching workflow history:", error);
      return NextResponse.json({ error: "Error al obtener historial" }, { status: 500 });
    }

    if (!actions || actions.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // 2. Enriquecer con nombres de usuario
    const userIds = Array.from(new Set(actions.map(a => a.user_id)));
    const { data: usersData } = await supabaseAdmin
      .from("usuarios")
      .select("auth_id, nombre_completo, correo")
      .in("auth_id", userIds);

    const userMap = new Map();
    if (usersData) {
      usersData.forEach(u => userMap.set(u.auth_id, u));
    }

    // 3. Obtener informacin de los nodos para saber si era firma o aprobacin
    const nodeIds = Array.from(new Set(actions.map(a => a.node_id)));
    const { data: nodesData } = await supabaseAdmin
      .from("workflow_nodes")
      .select("id, action_required, step_order")
      .in("id", nodeIds);
      
    const nodeMap = new Map();
    if (nodesData) {
      nodesData.forEach(n => nodeMap.set(n.id, n));
    }

    const history = actions.map(action => ({
      ...action,
      user: userMap.get(action.user_id) || { nombre_completo: "Usuario Desconocido" },
      node: nodeMap.get(action.node_id) || null
    }));

    return NextResponse.json({ data: history });
  } catch (error: any) {
    console.error("Error in workflow history route:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
