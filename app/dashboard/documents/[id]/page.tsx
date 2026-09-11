import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DocumentRedirectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: recurso } = await supabase
    .from("recursos")
    .select(`
      id,
      sala_id,
      salas (
        backroom_id
      )
    `)
    .eq("id", id)
    .single();

  if (!recurso || !recurso.salas) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="bg-[#1e2020] border border-[#3f3f46] p-6 rounded-xl text-center max-w-md">
          <span className="material-symbols-outlined text-[48px] text-[#ef4444] mb-4">error</span>
          <h2 className="text-xl font-bold text-white mb-2">Documento no encontrado</h2>
          <p className="text-[#a1a1aa] mb-6">El documento solicitado no existe o fue eliminado.</p>
          <a href="/dashboard/pendientes" className="bg-[#7c3aed] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#6d28d9] transition-colors inline-block">
            Ir a mis pendientes
          </a>
        </div>
      </div>
    );
  }

  const backroomId = (recurso.salas as any).backroom_id;
  const salaId = recurso.sala_id;

  redirect(`/dashboard/backrooms/${backroomId}/salas/${salaId}/recursos/${id}`);
}
