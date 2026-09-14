import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { handleApiError } from "@/lib/api-error";

// Configuración de Vercel Cron
export const maxDuration = 300; // 5 minutos máximo

export async function GET(request: Request) {
  try {
    // Validar token secreto (opcional pero recomendado)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const supabase = createAdminClient();

    // 1. Obtener todas las organizaciones y sus planes
    const { data: orgs, error: orgsError } = await supabase
      .from("organizations")
      .select("id, plan");

    if (orgsError || !orgs) throw new Error("Error fetching organizations");

    let deletedCount = 0;

    // Procesar por organización
    for (const org of orgs) {
      const isFree = org.plan === "free";
      const daysToKeep = isFree ? 3 : 180; // 3 días para free, 6 meses (aprox 180 días) para Pro/Enterprise
      
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() - daysToKeep);
      const thresholdISO = thresholdDate.toISOString();

      // Buscar backrooms de esta org
      const { data: backrooms } = await supabase
        .from("backrooms")
        .select("id")
        .eq("organization_id", org.id);

      if (!backrooms || backrooms.length === 0) continue;

      const backroomIds = backrooms.map(b => b.id);

      // Buscar salas de esos backrooms
      const { data: salas } = await supabase
        .from("salas")
        .select("id")
        .in("backroom_id", backroomIds);

      if (!salas || salas.length === 0) continue;

      const salaIds = salas.map(s => s.id);

      // Buscar recursos viejos en esas salas
      const { data: oldResources } = await supabase
        .from("recursos")
        .select("id, url, tipo")
        .in("sala_id", salaIds)
        .lt("created_at", thresholdISO)
        .in("tipo", ["archivo", "pdf", "image", "video"]); // No borrar enlaces, solo archivos subidos

      if (oldResources && oldResources.length > 0) {
        // Borrar archivos de Storage
        const filesToRemove = oldResources.map(r => r.url);
        await supabase.storage.from("recursos").remove(filesToRemove);

        // Borrar registros de la base de datos
        const idsToRemove = oldResources.map(r => r.id);
        const { count } = await supabase
          .from("recursos")
          .delete({ count: 'exact' })
          .in("id", idsToRemove);

        deletedCount += count || 0;
      }
    }

    return NextResponse.json({ 
      success: true, 
      deleted_files: deletedCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return handleApiError(error);
  }
}
