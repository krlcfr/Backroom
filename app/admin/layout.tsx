import { requireAuth } from "@/lib/auth/session";
import { SuperAdminService } from "@/lib/services/superadmin.service";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();
  
  const isSuper = await SuperAdminService.isSuperAdmin(session.id);
  if (!isSuper) {
    redirect("/forbidden");
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#09090b]">
      {/* Header sencillo para el SuperAdmin */}
      <header className="flex h-16 shrink-0 items-center border-b border-[#27272a] px-6">
        <h1 className="text-lg font-bold text-[#e2e2e2]">BackRoom <span className="text-[#a1a1aa] font-normal">SuperAdmin</span></h1>
      </header>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
