import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OrganizationsService } from "@/lib/services/organizations.service";
import { AuditService } from "@/lib/services/audit.service";
import AuditTable from "./audit-table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Auditoría',
}

export default async function AuditoriaPage() {
  const supabase = await createClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const authId = sessionData.session?.user?.id ?? null;

  if (!authId) {
    redirect("/login");
  }

  let org = null;
  try {
    org = await OrganizationsService.getOrgForUser(authId);
  } catch (err) {
    // No org
  }

  if (!org) {
    redirect("/org/crear");
  }

  // Comprobar que sea Admin o Propietario para entrar a esta vista.
  // En nuestro sistema actual, `getOrgForUser` no devuelve el rol, pero podemos usar el endpoint
  // o asumirlo y dejar que la API lo rechace (RLS de audit_logs bloquea).
  
  // Cargamos los primeros logs
  let logs: any[] = [];
  try {
    const res = await AuditService.listLogs(authId, org.id, 50, 0);
    logs = res.data ?? [];
  } catch (error) {
    // Podría lanzar 403 o vacío por RLS si no es admin
    logs = [];
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#e2e2e2]">Auditoría y Trazabilidad</h1>
          <p className="text-sm text-[#ccc3d8] mt-1">
            Registro de actividades críticas en la organización: {org.name}
          </p>
        </div>
      </div>
      
      <div className="rounded-xl border border-[#3f3f46] bg-[#18181b] shadow">
        <AuditTable initialLogs={logs} orgId={org.id} />
      </div>
    </div>
  );
}
