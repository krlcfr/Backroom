import { requireAuth } from "@/lib/auth/session";
import { SuperAdminService } from "@/lib/services/superadmin.service";
import { AdminCharts } from "./admin-charts";
import { redirect } from "next/navigation";

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
      {/* Fondo animado sutil inspirado en las luces y sombras de Backroom */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute -left-[10%] -top-[10%] h-3/4 w-3/4 animate-[pulse_8s_ease-in-out_infinite] rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute -right-[10%] -bottom-[10%] h-3/4 w-3/4 animate-[pulse_10s_ease-in-out_infinite_alternate] rounded-full bg-purple-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 pt-4">
        <div>
          <h2 className="text-3xl font-bold text-[#e2e2e2] tracking-tight">Centro de Control Global</h2>
          <p className="text-sm text-[#a1a1aa] mt-2">
            Visión panorámica de todas las organizaciones en BackRoom.
          </p>
        </div>
      </div>

      {/* Tarjetas de Métricas con estilo "glass" premium */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 relative z-10">
        
        <div className="group rounded-2xl border border-[#3f3f46]/40 bg-[#18181b]/40 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl transition-all hover:border-[#7c3aed]/50 hover:bg-[#18181b]/60 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#7c3aed]/10 text-[#d2bbff] group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">group</span>
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              +12%
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-[#e2e2e2] tracking-tight">{metrics.users}</h3>
            <p className="text-sm font-medium text-[#a1a1aa] mt-1">Total Usuarios</p>
          </div>
        </div>

        <div className="group rounded-2xl border border-[#3f3f46]/40 bg-[#18181b]/40 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl transition-all hover:border-[#7c3aed]/50 hover:bg-[#18181b]/60 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#7c3aed]/10 text-[#d2bbff] group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">domain</span>
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              +45
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-[#e2e2e2] tracking-tight">{metrics.organizations}</h3>
            <p className="text-sm font-medium text-[#a1a1aa] mt-1">Organizaciones</p>
          </div>
        </div>

        <div className="group rounded-2xl border border-[#3f3f46]/40 bg-[#18181b]/40 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl transition-all hover:border-[#7c3aed]/50 hover:bg-[#18181b]/60 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#7c3aed]/10 text-[#d2bbff] group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">meeting_room</span>
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-[#e2e2e2] tracking-tight">{metrics.rooms}</h3>
            <p className="text-sm font-medium text-[#a1a1aa] mt-1">Total Salas</p>
          </div>
        </div>

        <div className="group rounded-2xl border border-[#3f3f46]/40 bg-[#18181b]/40 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl transition-all hover:border-[#7c3aed]/50 hover:bg-[#18181b]/60 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#7c3aed]/10 text-[#d2bbff] group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">database</span>
            </div>
            <span className="text-xs font-medium text-[#a1a1aa]">
              62% usado
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-[#e2e2e2] tracking-tight">{formatBytes(metrics.storageBytes)}</h3>
            <p className="text-sm font-medium text-[#a1a1aa] mt-1">Almacenamiento</p>
            <div className="w-full bg-[#27272a] rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-[#7c3aed] h-1.5 rounded-full" style={{ width: '62%' }}></div>
            </div>
          </div>
        </div>

      </div>

      <AdminCharts metrics={metrics} />
    </div>
  );
}
