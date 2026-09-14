import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { handleApiError, ApiError } from "@/lib/api-error";
import { OrganizationsService } from "@/lib/services/organizations.service";
import { AuditService } from "@/lib/services/audit.service";
import puppeteer from "puppeteer";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const user = await requireAuth();
    const { orgId } = await params;

    // Verificar pertenencia y permisos
    const organization = await OrganizationsService.getById(user.id, orgId);
    if (!organization) {
      throw new ApiError(404, "Organización no encontrada");
    }

    // Listar todos los logs para el reporte (limitado a 500 para evitar que explote la memoria)
    const res = await AuditService.listLogs(user.id, orgId, 500, 0);
    const logs = res.data ?? [];

    // Generar el HTML
    const reportDate = new Date().toLocaleDateString("es-CO", { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' });

    let tableRows = "";
    for (const log of logs) {
      const date = new Date(log.created_at).toLocaleString("es-CO");
      const actor = log.actor?.nombre_completo || log.actor?.username || log.actor?.correo || "Desconocido";
      tableRows += `
        <tr>
          <td>${date}</td>
          <td>${actor}</td>
          <td>${log.action}</td>
        </tr>
      `;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 40px; }
          .header { text-align: center; border-bottom: 2px solid #7c3aed; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-size: 24px; font-weight: bold; margin: 0; color: #18181b; }
          .subtitle { font-size: 14px; color: #666; margin-top: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; font-size: 12px; }
          th { background-color: #f4f4f5; color: #3f3f46; font-weight: bold; }
          tr:nth-child(even) { background-color: #fafafa; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">Reporte de Auditoría y Trazabilidad</h1>
          <div class="subtitle">Organización: <strong>${organization.name}</strong></div>
          <div class="subtitle">Generado el: ${reportDate}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 25%">Fecha</th>
              <th style="width: 35%">Usuario</th>
              <th style="width: 40%">Acción</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "domcontentloaded" });
    
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
    });
    
    await browser.close();

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="auditoria_${orgId}.pdf"`
      },
    });

  } catch (error) {
    return handleApiError(error);
  }
}
