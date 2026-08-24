import { SuperAdminService } from "@/lib/services/superadmin.service";

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default async function AdminPage() {
  const metrics = await SuperAdminService.getPlatformMetrics();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-[#e2e2e2]">Métricas Globales</h2>
        <p className="text-sm text-[#a1a1aa] mt-1">
          Visión general del estado actual de la plataforma BackRoom.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Usuarios */}
        <div className="rounded-xl border border-[#27272a] bg-[#18181b] p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
              <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-[#a1a1aa]">Total Usuarios</p>
              <h3 className="text-2xl font-bold text-[#e2e2e2]">{metrics.users}</h3>
            </div>
          </div>
        </div>

        {/* Organizaciones */}
        <div className="rounded-xl border border-[#27272a] bg-[#18181b] p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
              <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-[#a1a1aa]">Organizaciones</p>
              <h3 className="text-2xl font-bold text-[#e2e2e2]">{metrics.organizations}</h3>
            </div>
          </div>
        </div>

        {/* Salas */}
        <div className="rounded-xl border border-[#27272a] bg-[#18181b] p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
              <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-[#a1a1aa]">Total Salas</p>
              <h3 className="text-2xl font-bold text-[#e2e2e2]">{metrics.rooms}</h3>
            </div>
          </div>
        </div>

        {/* Almacenamiento */}
        <div className="rounded-xl border border-[#27272a] bg-[#18181b] p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
              <svg className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-[#a1a1aa]">Almacenamiento</p>
              <h3 className="text-2xl font-bold text-[#e2e2e2]">{formatBytes(metrics.storageBytes)}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
