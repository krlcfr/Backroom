// Corrige el hueco de seguridad detectado en revision: admin/ vivia sin ningun
// guardia de sesion ni de rol. Este layout debe verificar sesion Y rol SuperAdmin
// especificamente (no Admin de BackRoom, no Miembro) antes de renderizar admin/page.tsx.
// TODO: reemplazar por las funciones reales cuando lib/auth/session.ts y lib/auth/rbac.ts existan
// import { requireAuth } from "@/lib/auth/session";
// import { checkPermission } from "@/lib/auth/rbac";
// import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // const session = await requireAuth();
  // if (!checkPermission(session.role, "SuperAdmin")) redirect("/dashboard?error=acceso-denegado");
  return <div className="admin-layout">{children}</div>;
}
