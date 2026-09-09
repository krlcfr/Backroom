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

  // Si no es el propietario, expulsarlo de esta ruta
  if (!org || org.ownerId !== perfil?.id) {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
