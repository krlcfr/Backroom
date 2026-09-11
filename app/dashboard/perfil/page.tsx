import { createClient } from "@/lib/supabase/server";
import { getUsuarioInterno } from "@/lib/auth/rbac";
import PerfilConfigClient from "./perfil-client";

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>No autorizado</div>;
  }

  const perfil = await getUsuarioInterno(user.id);
  
  if (!perfil) {
    return <div>Perfil no encontrado</div>;
  }

  return (
    <div className="flex-1 w-full p-4 md:p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#7c3aed] flex items-center justify-center text-2xl font-bold text-white shadow-lg">
            {perfil.nombre_completo.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#e2e2e2]">{perfil.nombre_completo}</h1>
            <p className="text-[#958da1]">{perfil.correo}</p>
          </div>
        </div>
        
        <div className="bg-[#1e2020] border border-[#3f3f46] rounded-xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-[#3f3f46]">
            <h2 className="text-xl font-semibold text-[#e2e2e2] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#d2bbff]">draw</span>
              Configuración de Firma Personal
            </h2>
            <p className="text-[#958da1] text-sm mt-1">
              Guarda tu firma visual para estamparla en los documentos que apruebes.
            </p>
          </div>
          
          <div className="p-6">
            <PerfilConfigClient 
              userId={perfil.id} 
              initialSignatureUrl={perfil.visual_signature_url} 
              authId={user.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
