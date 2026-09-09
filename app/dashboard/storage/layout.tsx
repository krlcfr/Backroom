import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUsuarioInterno } from '@/lib/auth/rbac';
import { OrganizationsService } from '@/lib/services/organizations.service';

export default async function StorageLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const authId = sessionData.session?.user?.id;

  if (!authId) {
    redirect('/auth/login');
  }

  const org = await OrganizationsService.getOrgForUser(authId);
  const perfil = await getUsuarioInterno(authId);

  let isAdmin = false;
  if (org && org.ownerId !== perfil?.id) {
    const { data: adminCheck } = await supabase.rpc('is_org_admin', { org: org.id });
    isAdmin = !!adminCheck;
  }

  // Si no es el propietario ni admin, expulsarlo de esta ruta
  if (!org || (org.ownerId !== perfil?.id && !isAdmin)) {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
