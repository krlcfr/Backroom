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
  { params }: { params: Promise<{ id: string; nodeId: string }> }
) {
  try {
    const user = await requireAuth();
    const { id, nodeId } = await params;
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
      .eq("id", id)
      .single();
    
    if (!workflow) throw new ApiError(404, "Workflow no encontrado");

    const supabaseAdmin = createAdminClient();
    const { data: document } = await supabaseAdmin
      .from("recursos")
      .select("url")
      .eq("id", workflow.document_id)
      .single();
    
    if (!document) throw new ApiError(404, "Documento no encontrado");

    const { data: perfil } = await supabase
      .from("usuarios")
      .select("id, visual_signature_url")
      .eq("auth_id", user.id)
      .single();
    
    if (!perfil) throw new ApiError(404, "Perfil no encontrado");

    // 3. Obtener posiciones de la firma
    const { data: posData } = await supabaseAdmin
      .from('workflow_signature_positions')
      .select('*')
      .eq('workflow_node_id', nodeId)
      .single();

    // 4. Descargar el PDF del Storage
    const { data: fileData, error: fileError } = await supabaseAdmin.storage
      .from("recursos")
      .download(document.url);

    if (fileError || !fileData) {
      throw new ApiError(500, "Error descargando el PDF para la firma.");
    }

    let buffer = Buffer.from(await fileData.arrayBuffer());

    // 5. Aplicar Firma Visual (pdf-lib)
    if (perfil.visual_signature_url && posData) {
      try {
        const { PDFDocument } = require('pdf-lib');
        
        // Descargar imagen de firma
        const { data: sigData, error: sigError } = await supabaseAdmin.storage
          .from('signatures')
          .download(perfil.visual_signature_url);
          
        if (!sigError && sigData) {
          const sigBuffer = await sigData.arrayBuffer();
          const pdfDoc = await PDFDocument.load(buffer);
          
          // La imagen puede ser PNG
          const pngImage = await pdfDoc.embedPng(sigBuffer).catch(async () => {
             // Fallback a JPEG si es necesario
             return await pdfDoc.embedJpg(sigBuffer);
          });
          
          const pages = pdfDoc.getPages();
          const pageIndex = posData.page_number - 1;
          if (pageIndex >= 0 && pageIndex < pages.length) {
            const page = pages[pageIndex];
            const { width, height } = page.getSize();
            
            // Convertir porcentajes a coordenadas (0,0 es bottom-left en pdf-lib)
            const x = (posData.pos_x_percent / 100) * width;
            const y = height - ((posData.pos_y_percent / 100) * height) - posData.height_px; // Ajuste porque Y de DOM empieza arriba
            
            page.drawImage(pngImage, {
              x: x,
              y: y,
              width: posData.width_px,
              height: posData.height_px,
            });
            
            const pdfBytes = await pdfDoc.save();
            buffer = Buffer.from(pdfBytes);
            
            // Sobrescribir el PDF en Supabase con la nueva versión visual
            await supabaseAdmin.storage.from('recursos').upload(document.url, buffer, {
              contentType: 'application/pdf',
              upsert: true
            });
          }
        }
      } catch (e) {
        console.error("Error aplicando firma visual:", e);
        // Continuamos incluso si falla la firma visual
      }
    }

    // 6. Fetch Organization's PKI Certificate details
    const { data: org } = await supabaseAdmin
      .from("organizations")
      .select("certificate_path, certificate_password")
      .eq("id", workflow.organization_id)
      .single();
    
    let signatureBase64 = "visual-signature-only";
    let contentHash = "";
    let serial = "";
    let isPki = false;

    // Solo intentar PKI si la organización lo configuró
    if (org?.certificate_path && org?.certificate_password) {
      // Download Certificate from Storage
      const { data: p12Data, error: p12Error } = await supabaseAdmin.storage
        .from("certificates")
        .download(org.certificate_path);
      
      if (!p12Error && p12Data) {
        const p12ArrayBuffer = await p12Data.arrayBuffer();
        
        let privateKey, certificate;
        try {
          const extracted = PKIService.extractPrivateKeyFromP12(p12ArrayBuffer, org.certificate_password);
          privateKey = extracted.privateKey;
          certificate = extracted.certificate;
          serial = extracted.serial;
          
          const signResult = PKIService.signContent(buffer, privateKey);
          contentHash = signResult.contentHash;
          signatureBase64 = signResult.signatureBase64;
          isPki = true;
        } catch (e: any) {
          console.error("Error en PKI:", e);
        }
      }
    }

    // 7. Guardar metadatos de la firma en la BD
    const { error: sigError } = await supabase.from("document_signatures").insert({
      recurso_id: workflow.document_id,
      usuario_id: perfil.id,
      workflow_id: id,
      node_id: nodeId,
      signature_hash: signatureBase64,
      certificate_serial: serial || "visual",
      signed_content_hash: contentHash || "visual",
      is_pki: isPki
    });

    if (sigError) {
      throw new ApiError(500, "Error al guardar la firma en la base de datos.");
    }

    // 8. Audit Log specific to Signature
    await AuditService.logAction({
      orgId: workflow.organization_id,
      actorId: perfil.id,
      // @ts-ignore
      action: isPki ? "DOCUMENT_PKI_SIGNED" : "DOCUMENT_VISUAL_SIGNED",
      targetType: "document_signature",
      targetId: workflow.document_id,
      details: {
        hash: contentHash,
        serial: serial,
        isPki: isPki
      }
    });

    // 9. Advance Workflow
    await WorkflowsService.approveNode(id, nodeId, "approved");

    return NextResponse.json({ 
      success: true, 
      message: "Firma electrónica aplicada y documento aprobado exitosamente.",
      signatureHash: signatureBase64 
    });

  } catch (error) {
    return handleApiError(error);
  }
}
