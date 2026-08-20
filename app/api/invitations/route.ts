import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { handleApiError, ApiError } from "@/lib/api-error";
import { isOwner, getUsuarioInterno } from "@/lib/auth/rbac";
import { z } from "zod";

const createInvitationSchema = z.object({
  backroom_id: z.string().uuid(),
  email: z.string().email(),
});

// POST /api/invitaciones — BE-49
// Crea una invitación por email a un backroom. Solo el propietario puede invitar.
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const input = createInvitationSchema.parse(body);

    const owner = await isOwner(user.id, input.backroom_id);
    if (!owner) throw new ApiError(403, "Solo el propietario puede invitar miembros.");

    const usuario = await getUsuarioInterno(user.id);
    if (!usuario) throw new ApiError(404, "Perfil de usuario no encontrado.");

    // Normalizar email a minúsculas para evitar problemas de case-sensitivity
    const emailLower = input.email.toLowerCase();

    const supabase = createAdminClient();

    // 1️⃣ Verificar que el usuario no exista ya en la base (correo duplicado)
    const { data: userExists } = await supabase
      .from("usuarios")
      .select("id")
      .eq("correo", emailLower)
      .maybeSingle();

    if (userExists) throw new ApiError(409, "Ya existe una cuenta con ese correo electrónico.");

    // 3️⃣ Verificar que el backroom existe (para evitar foreign-key errors)
    const { data: backroom } = await supabase
      .from("backrooms")
      .select("id, nombre")
      .eq("id", input.backroom_id)
      .maybeSingle();

    if (!backroom) throw new ApiError(400, "El backroom especificado no existe.");

    // 4️⃣ Verificar que no exista ya una invitación (activa o pendente) para este email en este backroom
    const { data: existingActive } = await supabase
      .from("invitaciones")
      .select("id")
      .eq("backroom_id", input.backroom_id)
      .eq("email", emailLower)
      .maybeSingle();

    const { data: existingPending } = await supabase
      .from("invitaciones")
      .select("id")
      .eq("backroom_id", input.backroom_id)
      .eq("email", emailLower)
      .eq("activa", false)
      .maybeSingle();

    if (existingActive) throw new ApiError(409, "Ya existe una invitación activa para este email.");
    if (existingPending) throw new ApiError(409, "Ya existe una invitación pendiente para este email.");

    // 5️⃣ Insertar la invitación
    const codigo = `BR-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const expira_en = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("invitaciones")
      .insert({
        backroom_id: input.backroom_id,
        creado_por: usuario.id,
        email: emailLower,
        codigo,
        activa: true,
        expira_en,
      })
      .select()
      .single();

    // 6️⃣ Manejo detallado del error de Supabase
    if (error) {
      console.error("❌ Error Supabase creando invitación:", error);

      // --- Mensajes claros según el tipo de error ---
      if (error.message && error.message.includes("violación de restricción única")) {
        throw new ApiError(409, "Ya existe una invitación para este email en este backroom.");
      }
      if (error.message && error.message.includes("violación de seguridad de nivel de fila")) {
        throw new ApiError(403, "No tienes permisos para crear invitaciones en este backroom. Revisa las políticas RLS de Supabase.");
      }
      if (error.message && error.message.includes("foreign key constraint")) {
        throw new ApiError(400, "El backroom_id especificado no existe o el usuario creador no es válido.");
      }
      // Error genérico: mostrar el mensaje de Supabase para depuración (quítalo en producción)
      throw new ApiError(500, "Error interno al crear la invitación. Revisa la consola del servidor: " + error.message);
    }

    if (!data) throw new ApiError(500, "No se pudo crear la invitación.");

    return NextResponse.json({ data: { invitation: data } }, { status: 201 });
  } catch (error) {
    console.error("Error en create invitation route:", error);
    return handleApiError(error);
  }
}