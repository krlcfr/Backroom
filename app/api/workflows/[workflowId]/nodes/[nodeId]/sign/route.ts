import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { handleApiError, ApiError } from "@/lib/api-error";
import { WorkflowsService } from "@/lib/services/workflows.service";
import { PKIService } from "@/lib/services/pki.service";
import { AuditService } from "@/lib/services/audit.service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workflowId: string; nodeId: string }> }
) {
  try {
    const user = await requireAuth();
    const { workflowId, nodeId } = await params;
    const body = await req.json();
    
    // We expect the user's login password for confirmation (2FA-like)
    const { password } = body;
    if (!password) {
      throw new ApiError(400, "Debe ingresar su contraseña para firmar");
    }

    const supabase = await createClient();

    // 1. Validate user password (re-auth check)
    // We get the user's email from auth
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser?.email) throw new ApiError(401, "No se encontró el email del usuario");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: authUser.email,
      password: password
    });

    if (signInError) {
      throw new ApiError(401, "Contraseña incorrecta. La firma no fue autorizada.");
    }

    // 2. Fetch Workflow and Document
    const { data: workflow } = await supabase
      .from("document_workflows")
      .select("organization_id, document_id")
      .eq("id", workflowId)
      .single();
    
    if (!workflow) throw new ApiError(404, "Workflow no encontrado");

    const { data: document } = await supabase
      .from("recursos")
      .select("content, isHTML")
      .eq("id", workflow.document_id)
      .single();
    
    if (!document) throw new ApiError(404, "Documento no encontrado");

    // PKI solo para documentos HTML (texto nativo) por ahora
    if (!document.isHTML || !document.content) {
      throw new ApiError(400, "La firma electrónica PKI solo está soportada para documentos nativos (HTML).");
    }

    // 3. Fetch Organization's PKI Certificate details
    const supabaseAdmin = createAdminClient();
    const { data: org } = await supabaseAdmin
      .from("organizations")
      .select("certificate_path, certificate_password")
      .eq("id", workflow.organization_id)
      .single();
    
    if (!org?.certificate_path || !org?.certificate_password) {
      throw new ApiError(400, "La organización no tiene un certificado PKI (.p12) configurado. Comunícate con el administrador.");
    }

    // 4. Download .p12 from Storage
    const { data: fileData, error: fileError } = await supabaseAdmin.storage
      .from("certificates")
      .download(org.certificate_path);
    
    if (fileError || !fileData) {
      throw new ApiError(500, "Error al acceder al certificado criptográfico de la organización.");
    }

    const p12Buffer = await fileData.arrayBuffer();

    // 5. PKI Signing Ceremony
    let privateKey, certificate, serial;
    try {
      const extracted = PKIService.extractPrivateKeyFromP12(p12Buffer, org.certificate_password);
      privateKey = extracted.privateKey;
      certificate = extracted.certificate;
      serial = extracted.serial;
    } catch (e: any) {
      throw new ApiError(500, "Error al desencriptar el certificado maestro. Puede que la contraseña esté corrupta.");
    }

    // Generate Hash and Sign
    const { contentHash, signatureBase64 } = PKIService.signContent(document.content, privateKey);

    // 6. Save Signature to Database
    const { data: perfil } = await supabase.from("usuarios").select("id").eq("auth_id", user.id).single();
    if (!perfil) throw new ApiError(404, "Perfil no encontrado");

    const { error: sigError } = await supabase.from("document_signatures").insert({
      recurso_id: workflow.document_id,
      usuario_id: perfil.id,
      workflow_id: workflowId,
      node_id: nodeId,
      signature_hash: signatureBase64,
      certificate_serial: serial,
      signed_content_hash: contentHash,
      is_pki: true
    });

    if (sigError) {
      throw new ApiError(500, "Error al guardar la firma criptográfica en la base de datos.");
    }

    // 7. Audit Log specific to PKI
    await AuditService.logAction({
      orgId: workflow.organization_id,
      actorId: perfil.id,
      // @ts-ignore
      action: "DOCUMENT_PKI_SIGNED",
      targetType: "document_signature",
      targetId: workflow.document_id,
      details: {
        hash: contentHash,
        serial: serial
      }
    });

    // 8. Advance Workflow
    await WorkflowsService.approveNode(workflowId, nodeId, "approved");

    return NextResponse.json({ 
      success: true, 
      message: "Firma electrónica aplicada y documento aprobado exitosamente.",
      signatureHash: signatureBase64 
    });

  } catch (error) {
    return handleApiError(error);
  }
}
