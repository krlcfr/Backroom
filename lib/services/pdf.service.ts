/**
 * Servicio de frontend para generar PDFs sin carga al servidor.
 */
export const PDFService = {
  /**
   * Exporta el contenido de un elemento HTML a PDF.
   * @param elementId El ID del contenedor HTML a exportar.
   * @param filename El nombre del archivo a descargar.
   */
  exportElementToPDF: async (elementId: string, filename: string = 'documento.pdf') => {
    const element = document.getElementById(elementId);
    
    if (!element) {
      console.error(`No se encontró el elemento con ID: ${elementId}`);
      throw new Error("Elemento no encontrado para exportar a PDF.");
    }

    // Configuración para el PDF
    const opt = {
      margin:       1,
      filename:     filename,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in' as const, format: 'letter' as const, orientation: 'portrait' as const }
    };

    // Importar dinámicamente para evitar errores SSR
    const html2pdf = (await import('html2pdf.js')).default;

    // Generar y guardar
    return html2pdf().set(opt).from(element).save();
  }
};
