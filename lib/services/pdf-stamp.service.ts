import { PDFDocument } from 'pdf-lib';
import { createClient } from '@/lib/supabase/server';
import { ApiError } from '@/lib/api-error';

export class PdfStampService {
  /**
   * Genera un PDF parcial o completo estampando las firmas hasta un turno específico.
   * Si no se provee maxStepOrder, se estampan todas las firmas disponibles.
   */
  static async generateStampedPdf(
    documentId: string,
    workflowId: string,
    maxStepOrder?: number
  ): Promise<Uint8Array> {
    const supabase = await createClient();

    // 1. Obtener el documento original
    const { data: resource, error: resourceError } = await supabase
      .from('recursos')
      .select('url, tipo')
      .eq('id', documentId)
      .single();

    if (resourceError || !resource) {
      throw new ApiError(404, 'Documento no encontrado');
    }

    if (resource.tipo !== 'application/pdf') {
      throw new ApiError(400, 'El documento original debe ser un PDF para incrustar firmas');
    }

    // 2. Descargar el buffer del PDF original
    let pdfBuffer: ArrayBuffer;
    if (resource.url.startsWith('http')) {
      const resp = await fetch(resource.url);
      if (!resp.ok) throw new ApiError(500, 'Error descargando PDF original desde la URL');
      pdfBuffer = await resp.arrayBuffer();
    } else {
      // Asumimos formato "bucket/path/to/file"
      const parts = resource.url.split('/');
      const bucket = parts[0];
      const path = parts.slice(1).join('/');
      const { data: fileData, error: downloadError } = await supabase.storage.from(bucket).download(path);
      if (downloadError || !fileData) {
        throw new ApiError(500, 'Error descargando PDF desde Storage interno');
      }
      pdfBuffer = await fileData.arrayBuffer();
    }

    // 3. Obtener posiciones de firmas del workflow (que ya estén firmadas)
    const { data: positions, error: posError } = await supabase
      .from('workflow_signature_positions')
      .select(`
        *,
        workflow_nodes!inner(step_order, status)
      `)
      .eq('workflow_id', workflowId)
      .eq('is_signed', true);

    if (posError) {
      throw new ApiError(500, 'Error obteniendo coordenadas de firmas: ' + posError.message);
    }

    // Filtrar según el turno del usuario si es una descarga parcial
    let validPositions = positions || [];
    if (maxStepOrder !== undefined) {
      validPositions = validPositions.filter(
        // @ts-ignore
        (p) => p.workflow_nodes.step_order <= maxStepOrder
      );
    }

    if (validPositions.length === 0) {
      // No hay firmas válidas para estampar en este punto, devolvemos el original
      return new Uint8Array(pdfBuffer);
    }

    // 4. Obtener las imágenes (base64 o URLs) de estas firmas
    const nodeIds = validPositions.map(p => p.workflow_node_id);
    const { data: signatures, error: sigError } = await supabase
      .from('document_signatures')
      .select('node_id, signature_image_url')
      .eq('workflow_id', workflowId)
      .in('node_id', nodeIds);

    if (sigError) {
      console.warn("Aviso: Error obteniendo imágenes de firmas", sigError.message);
    }

    const signaturesMap = new Map<string, string>();
    signatures?.forEach(sig => {
      if (sig.node_id) {
        signaturesMap.set(sig.node_id, sig.signature_image_url);
      }
    });

    // 5. Inyectar (estampar) las imágenes en el PDF original con pdf-lib
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();

    for (const pos of validPositions) {
      // En la web la primera página suele ser 1. pages[] es 0-indexed.
      const pageIndex = pos.page_number - 1;
      if (pageIndex < 0 || pageIndex >= pages.length) continue;

      const page = pages[pageIndex];
      const { width: pageWidth, height: pageHeight } = page.getSize();
      const imageUrl = signaturesMap.get(pos.workflow_node_id);

      if (!imageUrl) continue;

      try {
        let imageBytes: ArrayBuffer;
        let isPng = true;

        if (imageUrl.startsWith('data:image')) {
          const base64Data = imageUrl.split(',')[1];
          imageBytes = Buffer.from(base64Data, 'base64');
          if (imageUrl.includes('jpeg') || imageUrl.includes('jpg')) isPng = false;
        } else {
          const resp = await fetch(imageUrl);
          imageBytes = await resp.arrayBuffer();
          const contentType = resp.headers.get('content-type') || '';
          if (contentType.includes('jpeg') || contentType.includes('jpg') || imageUrl.toLowerCase().endsWith('.jpg')) {
            isPng = false;
          }
        }

        const pdfImage = isPng 
          ? await pdfDoc.embedPng(imageBytes) 
          : await pdfDoc.embedJpg(imageBytes);

        // pdf-lib maneja el (0,0) en la esquina inferior izquierda (Bottom-Left)
        // La web maneja (0,0) en la esquina superior izquierda (Top-Left)
        const absX = (pos.pos_x_percent / 100) * pageWidth;
        const absYWeb = (pos.pos_y_percent / 100) * pageHeight;
        const absYPdfLib = pageHeight - absYWeb - pos.height_px;

        page.drawImage(pdfImage, {
          x: absX,
          y: absYPdfLib,
          width: pos.width_px,
          height: pos.height_px,
        });
      } catch (err) {
        console.error(`Error incrustando firma para nodo ${pos.workflow_node_id}:`, err);
      }
    }

    return await pdfDoc.save();
  }
}
