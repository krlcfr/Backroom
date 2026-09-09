import { createClient } from "@/lib/supabase/server";
import { OrganizationsService } from "@/lib/services/organizations.service";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const dynamic = 'force-dynamic';

export default async function PendientesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>No autorizado</div>;
  }

  // Identificar la organización activa del usuario (asumimos la primera o la que devuelve el service)
  const org = await OrganizationsService.getOrgForUser(user.id);

  // Obtener los workflows pendientes del usuario
  // Buscamos en workflow_nodes donde status = 'in_turn'
  // y que esté asignado al usuario o a su cargo
  const { data: nodes, error } = await supabase
    .from('workflow_nodes')
    .select(`
      id,
      action_required,
      created_at,
      document_workflows!inner (
        id,
        title,
        status,
        recursos!inner (
          id,
          name,
          sala_id,
          salas!inner (
            backroom_id
          )
        )
      )
    `)
    .eq('status', 'in_turn')
    // Nota: Por brevedad, este query directo asume asignación directa.
    // Si queremos por cargo, en el backend se debería hacer una subquery con rpc o filtrarlo
    .eq('assigned_user_id', user.id);

  const tasks = nodes || [];

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#e2e2e2] flex items-center gap-3">
          <span className="material-symbols-outlined text-[#7c3aed]">inbox</span>
          Mis Tareas Pendientes
        </h1>
        <p className="text-[#958da1] mt-2">
          Documentos y flujos que requieren tu firma o aprobación en este momento.
        </p>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-[#1a1c1c] border border-[#27272a] rounded-xl p-12 text-center flex flex-col items-center">
          <span className="material-symbols-outlined text-6xl text-[#3f3f46] mb-4">task_alt</span>
          <h3 className="text-lg font-medium text-[#e2e2e2]">¡Todo al día!</h3>
          <p className="text-[#958da1] mt-1">No tienes documentos pendientes de firmar o revisar.</p>
        </div>
      ) : (
        <div className="bg-[#1a1c1c] border border-[#27272a] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#27272a]/50 text-[#958da1] text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Documento</th>
                  <th className="px-6 py-4 font-medium">Acción Requerida</th>
                  <th className="px-6 py-4 font-medium">Fecha Asignación</th>
                  <th className="px-6 py-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272a]">
                {tasks.map((task: any) => {
                  const wf = task.document_workflows;
                  const doc = wf.recursos;
                  
                  // Para abrir el recurso, generamos la URL
                  // Depende de la estructura de salas y backrooms. 
                  const viewerUrl = `/dashboard/backrooms/${doc.salas.backroom_id}/salas/${doc.sala_id}/recursos`;

                  return (
                    <tr key={task.id} className="hover:bg-[#27272a]/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-[#d2bbff] bg-[#7c3aed]/10 p-2 rounded-lg">
                            description
                          </span>
                          <div>
                            <p className="font-medium text-[#e2e2e2]">{wf.title}</p>
                            <p className="text-xs text-[#958da1] truncate max-w-xs">{doc.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          task.action_required === 'sign' 
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {task.action_required === 'sign' ? 'Requiere Firma' : 'Requiere Aprobación'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#ccc3d8]">
                        {format(new Date(task.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`${viewerUrl}?docId=${doc.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          Ver Documento
                          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
