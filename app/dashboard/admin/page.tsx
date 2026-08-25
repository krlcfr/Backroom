import { requireAuth } from "@/lib/auth/session";
import { SuperAdminService } from "@/lib/services/superadmin.service";
import { AdminCharts } from "./admin-charts";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Panel de Administración',
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default async function AdminPage() {
  const session = await requireAuth();
  const isSuper = await SuperAdminService.isSuperAdmin(session.id);
  
  if (!isSuper) {
    redirect("/forbidden");
  }

  const metrics = await SuperAdminService.getPlatformMetrics();

  return (
    <div className="relative mx-auto max-w-6xl min-h-[calc(100vh-6rem)]">
      {/* Fondo animado inspirado en las luces y sombras de Backroom */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute -left-1/4 -top-1/4 h-1/2 w-1/2 animate-[pulse_8s_ease-in-out_infinite] rounded-full bg-blue-500/10 blur-[100px]" />
        <div className="absolute -right-1/4 bottom-0 h-1/2 w-1/2 animate-[pulse_10s_ease-in-out_infinite_alternate] rounded-full bg-purple-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 pt-4">
        <div>
          <h2 className="text-3xl font-bold text-[#e2e2e2] tracking-tight">Centro de Control Global</h2>
          <p className="text-sm text-[#a1a1aa] mt-2">
            Visión panorámica de todas las organizaciones en BackRoom.
          </p>
        </div>
      </div>

      {/* Tarjetas de Métricas con estilo "glass" */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 relative z-10">
        <div className="group rounded-2xl border border-[#27272a]/50 bg-[#18181b]/60 p-6 shadow-xl backdrop-blur-md transition-all hover:border-[#3f3f46] hover:bg-[#18181b]/80">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-[#a1a1aa]">Total Usuarios</p>
              <h3 className="text-3xl font-bold text-[#e2e2e2] tracking-tight">{metrics.users}</h3>
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border border-[#27272a]/50 bg-[#18181b]/60 p-6 shadow-xl backdrop-blur-md transition-all hover:border-[#3f3f46] hover:bg-[#18181b]/80">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-[#a1a1aa]">Organizaciones</p>
              <h3 className="text-3xl font-bold text-[#e2e2e2] tracking-tight">{metrics.organizations}</h3>
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border border-[#27272a]/50 bg-[#18181b]/60 p-6 shadow-xl backdrop-blur-md transition-all hover:border-[#3f3f46] hover:bg-[#18181b]/80">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-[#a1a1aa]">Total Salas</p>
              <h3 className="text-3xl font-bold text-[#e2e2e2] tracking-tight">{metrics.rooms}</h3>
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border border-[#27272a]/50 bg-[#18181b]/60 p-6 shadow-xl backdrop-blur-md transition-all hover:border-[#3f3f46] hover:bg-[#18181b]/80">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 group-hover:scale-110 transition-transform">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-[#a1a1aa]">Almacenamiento</p>
              <h3 className="text-3xl font-bold text-[#e2e2e2] tracking-tight">{formatBytes(metrics.storageBytes)}</h3>
            </div>
          </div>
        </div>
      </div>

      <AdminCharts metrics={metrics} />
    </div>
  );
}
