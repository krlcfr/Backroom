import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { OrganizationsService } from "@/lib/services/organizations.service";
import { createAdminClient } from "@/lib/supabase/admin";
import { handleApiError, ApiError } from "@/lib/api-error";
import { v4 as uuidv4 } from "uuid";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const user = await requireAuth();
    const { orgId } = await params;

    // Verificar si es propietario
    const org = await OrganizationsService.getOrgForUser(user.id);
    if (!org || org.id !== orgId || org.ownerId !== user.id) {
      throw new ApiError(403, "No tienes permisos para configurar esta organización");
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const password = formData.get("password") as string;

    if (!file || !password) {
      throw new ApiError(400, "Debe proporcionar el archivo .p12 y su contraseña");
    }

    if (!file.name.endsWith(".p12")) {
      throw new ApiError(400, "El certificado debe ser formato .p12");
    }

    const supabaseAdmin = createAdminClient();
    const fileName = `${orgId}/${uuidv4()}.p12`;

    // 1. Subir al bucket privado
    const buffer = await file.arrayBuffer();
    const { error: storageError } = await supabaseAdmin.storage
      .from("certificates")
      .upload(fileName, buffer, {
        contentType: "application/x-pkcs12",
        upsert: false
      });

    if (storageError) {
      throw new ApiError(500, "Error al guardar el certificado: " + storageError.message);
    }

    // 2. Actualizar la organización
    // Idealmente la contraseña debería encriptarse, pero por MVP la guardamos (asegurarnos que organizaciones tenga RLS)
    const { error: dbError } = await supabaseAdmin
      .from("organizations")
      .update({
        certificate_path: fileName,
        certificate_password: password
      })
      .eq("id", orgId);

    if (dbError) {
      // Rollback
      await supabaseAdmin.storage.from("certificates").remove([fileName]);
      throw new ApiError(500, "Error al actualizar la base de datos");
    }

    return NextResponse.json({ message: "Certificado guardado con éxito" }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
