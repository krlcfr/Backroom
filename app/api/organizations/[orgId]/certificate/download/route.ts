
import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getUsuarioInterno } from "@/lib/auth/rbac";
import { OrganizationsService } from "@/lib/services/organizations.service";

export async function GET(req: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await params;
    const supabase = await createClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const authId = sessionData.session?.user?.id;

    if (!authId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const org = await OrganizationsService.getOrgForUser(authId);
    const perfil = await getUsuarioInterno(authId);

    // Only owner can download the certificate for security reasons
    if (!org || org.id !== orgId || org.ownerId !== perfil?.id) {
      return NextResponse.json({ error: "Prohibido. Solo el propietario puede descargar el certificado." }, { status: 403 });
    }

    if (!org.certificatePath) {
      return NextResponse.json({ error: "No hay certificado configurado." }, { status: 404 });
    }

    const supabaseAdmin = createAdminClient();
    const { data: fileData, error: fileError } = await supabaseAdmin.storage
      .from("certificates")
      .download(org.certificatePath);

    if (fileError || !fileData) {
      return NextResponse.json({ error: "Error al descargar el archivo del certificado." }, { status: 500 });
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/x-pkcs12",
        "Content-Disposition": `attachment; filename="certificado-${org.name.replace(/\s+/g, '-')}.p12"`
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

}
