import { createClient } from "@/lib/supabase/server";
import { OrganizationsService } from "@/lib/services/organizations.service";
import { getUsuarioInterno } from "@/lib/auth/rbac";
import { PricingCards } from "@/components/pricing/pricing-cards";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function PlanesPage() {
  const supabase = await createClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const authId = sessionData.session?.user?.id ?? null;

  if (!authId) {
    redirect("/login");
  }

  const org = await OrganizationsService.getOrgForUser(authId);
  const perfil = await getUsuarioInterno(authId);
  const esPropietario = org !== null && org.ownerId === perfil?.id;

  if (!org) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-[20px] font-semibold text-[#e2e2e2] mb-2">Sin organización</h2>
        <p className="text-[#ccc3d8] mb-6">Debes pertenecer a una organización para ver los planes.</p>
        <Link href="/org/crear" className="bg-[#7c3aed] text-white px-4 py-2 rounded-lg text-[12px] font-medium">
          Crear organización
        </Link>
      </div>
    );
  }

  // Fetch the current plan directly from DB
  const { data: orgDB } = await supabase
    .from("organizations")
    .select("plan, subscription_status")
    .eq("id", org.id)
    .single();

  const currentPlan = orgDB?.plan ?? "free";
  const status = orgDB?.subscription_status;

  return (
    <div className="flex flex-col flex-1 pb-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg font-semibold text-[#e2e2e2] mb-2">Planes de Pago</h1>
          <p className="text-[#ccc3d8]">Administra tu suscripción y aumenta los límites de tu organización.</p>
        </div>
      </div>

      {!esPropietario ? (
        <div className="rounded-xl border border-[#4a4455] bg-[#1e2020] p-8 text-center">
          <span className="material-symbols-outlined text-[#ffb4ab] text-[48px] mb-4 block">lock</span>
          <p className="text-[14px] text-[#ffb4ab]">
            Solo el Propietario de la organización puede gestionar los planes de pago.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          {status && status !== "active" && status !== "trialing" && currentPlan !== "free" && (
            <div className="w-full max-w-5xl mb-8 p-4 bg-[#ffb4ab]/10 border border-[#ffb4ab]/20 rounded-lg flex items-center gap-3">
              <span className="material-symbols-outlined text-[#ffb4ab]">error</span>
              <p className="text-sm text-[#ffb4ab]">
                Hay un problema con tu suscripción (Estado: {status}). Por favor actualiza tu método de pago.
              </p>
            </div>
          )}
          
          <PricingCards mode="dashboard" organizationId={org.id} currentPlan={currentPlan} />
        </div>
      )}
    </div>
  );
}
