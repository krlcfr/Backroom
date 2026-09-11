import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUsuarioInterno } from '@/lib/auth/rbac';
import { OrganizationsService } from '@/lib/services/organizations.service';
import ConfigTabs from './config-tabs';

export default async function ConfigLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const authId = sessionData.session?.user?.id;

  if (!authId) {
    redirect('/auth/login');
  }

  const org = await OrganizationsService.getOrgForUser(authId);
  const perfil = await getUsuarioInterno(authId);

  // Permitimos que entren todos para ver al menos "Miembros", la vista se encarga de proteger "Perfil" y "Planes"
  const esPropietario = org !== null && org.ownerId === perfil?.id;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#e2e2e2]">Configuración</h1>
        <p className="text-sm text-[#ccc3d8] mt-1">Ajustes generales, miembros y facturación de la organización.</p>
      </div>
      
      <ConfigTabs esPropietario={esPropietario} />
      
      <div className="mt-8">
        {children}
      </div>
    </div>
  );
}
