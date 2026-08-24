import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import mammoth from "mammoth";
import puppeteer from "puppeteer";
import { handleApiError } from "@/lib/api-error";
import { ApiError } from "@/lib/api-error";

export async function POST(request: NextRequest) {
  try {
    await requireAuth(); // Solo usuarios autenticados pueden convertir documentos

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      throw new ApiError(400, "No se ha proporcionado ningún archivo");
    }

    if (!file.name.endsWith(".docx")) {
      throw new ApiError(400, "El archivo debe ser un documento de Word (.docx)");
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. DOCX to HTML using Mammoth
    const { value: html } = await mammoth.convertToHtml({ buffer });

    // Envolver el HTML con estilos básicos para que se vea como un documento
    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          table {
            border-collapse: collapse;
            width: 100%;
          }
          table, th, td {
            border: 1px solid black;
          }
          th, td {
            padding: 8px;
            text-align: left;
          }
          img {
            max-width: 100%;
            height: auto;
          }
        </style>
      </head>
      <body>
        ${html}
      </body>
      </html>
    `;

    // 2. HTML to PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: "domcontentloaded" });
    
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "20mm",
        bottom: "20mm",
        left: "20mm",
      },
    });

    await browser.close();

    // 3. Return the PDF as a Blob response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${file.name.replace('.docx', '.pdf')}"`,
      },
    });

  } catch (error) {
    return handleApiError(error);
  }
}
