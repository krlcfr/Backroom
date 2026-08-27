"use client";

import { useState } from "react";
import { PDFService } from "@/lib/services/pdf.service";
import { WorkflowBuilderModal } from "@/components/workflows/WorkflowBuilderModal";

interface DocumentCreationWizardModalProps {
  onClose: () => void;
  orgId: string;
  onAddResource?: (type: 'doc' | 'pdf' | 'media' | 'link') => void;
}

type Step = 'menu' | 'editor' | 'workflow';

export function DocumentCreationWizardModal({ onClose, orgId, onAddResource }: DocumentCreationWizardModalProps) {
  const [step, setStep] = useState<Step>('menu');
  const [documentContent, setDocumentContent] = useState("<p>Comienza a escribir tu documento...</p>");

  const handleExportPDF = async () => {
    try {
      await PDFService.exportElementToPDF('document-content-area', 'Nuevo_Documento.pdf');
    } catch (error) {
      console.error(error);
      alert("Error al exportar PDF");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[110] backdrop-blur-sm">
      <div className="bg-[#121414] w-full max-w-4xl h-[80vh] rounded-2xl border border-[#3f3f46] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="h-16 px-6 border-b border-[#3f3f46] flex items-center justify-between shrink-0 bg-[#1a1c1c]">
          <div className="flex items-center gap-4">
            {step !== 'menu' && (
              <button 
                onClick={() => setStep('menu')}
                className="text-[#958da1] hover:text-[#e2e2e2] flex items-center gap-2 transition-colors text-sm font-medium"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Regresar al Menú
              </button>
            )}
            <h2 className="text-[18px] font-semibold text-[#e2e2e2]">
              Recursos
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#333535] text-[#958da1] hover:text-[#e2e2e2] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {step === 'menu' && (
            <div className="max-w-2xl mx-auto h-full flex flex-col justify-center">
              <h3 className="text-[24px] font-semibold text-center mb-8 text-[#e2e2e2]">
                ¿Qué tipo de recurso deseas añadir?
              </h3>
              
              <div className="grid grid-cols-3 gap-6 max-w-[600px] mx-auto">
                
                {/* 1. Crear desde cero */}
                <button 
                  onClick={() => setStep('editor')}
                  className="w-full h-44 bg-[#27272a] hover:bg-[#303036] border border-[#3f3f46] hover:border-[#7c3aed] rounded-xl flex flex-col items-center justify-center gap-4 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#18181b] group-hover:bg-[#3b0764] flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-[24px] text-[#7c3aed]">edit_document</span>
                  </div>
                  <div className="text-center px-2">
                    <span className="block text-sm font-semibold text-[#e2e2e2]">Crear Documento</span>
                  </div>
                </button>

                {/* 2. Subir Archivo */}
                <button 
                  onClick={() => onAddResource && onAddResource('doc')}
                  className="w-full h-44 bg-[#27272a] hover:bg-[#303036] border border-[#3f3f46] hover:border-[#7c3aed] rounded-xl flex flex-col items-center justify-center gap-4 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#18181b] group-hover:bg-[#3b0764] flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-[24px] text-[#7c3aed]">description</span>
                  </div>
                  <div className="text-center px-2">
                    <span className="block text-sm font-semibold text-[#e2e2e2]">Subir Doc / Txt</span>
                  </div>
                </button>

                {/* 3. Subir PDF */}
                <button 
                  onClick={() => onAddResource && onAddResource('pdf')}
                  className="w-full h-44 bg-[#27272a] hover:bg-[#303036] border border-[#3f3f46] hover:border-[#7c3aed] rounded-xl flex flex-col items-center justify-center gap-4 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#18181b] group-hover:bg-[#3b0764] flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-[24px] text-[#7c3aed]">picture_as_pdf</span>
                  </div>
                  <div className="text-center px-2">
                    <span className="block text-sm font-semibold text-[#e2e2e2]">Subir PDF</span>
                  </div>
                </button>

                {/* 4. Subir Audio/Video */}
                <button 
                  onClick={() => onAddResource && onAddResource('media')}
                  className="w-full h-44 bg-[#27272a] hover:bg-[#303036] border border-[#3f3f46] hover:border-[#7c3aed] rounded-xl flex flex-col items-center justify-center gap-4 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#18181b] group-hover:bg-[#3b0764] flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-[24px] text-[#7c3aed]">play_circle</span>
                  </div>
                  <div className="text-center px-2">
                    <span className="block text-sm font-semibold text-[#e2e2e2]">Audio / Video</span>
                  </div>
                </button>

                {/* 5. Añadir Enlace */}
                <button 
                  onClick={() => onAddResource && onAddResource('link')}
                  className="w-full h-44 bg-[#27272a] hover:bg-[#303036] border border-[#3f3f46] hover:border-[#7c3aed] rounded-xl flex flex-col items-center justify-center gap-4 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#18181b] group-hover:bg-[#3b0764] flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-[24px] text-[#7c3aed]">link</span>
                  </div>
                  <div className="text-center px-2">
                    <span className="block text-sm font-semibold text-[#e2e2e2]">Añadir Enlace</span>
                  </div>
                </button>

                {/* 6. Asignar Flujo */}
                <button 
                  onClick={() => setStep('workflow')}
                  className="w-full h-44 bg-[#27272a] hover:bg-[#303036] border border-[#3f3f46] hover:border-[#7c3aed] rounded-xl flex flex-col items-center justify-center gap-4 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#18181b] group-hover:bg-[#3b0764] flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-[24px] text-[#7c3aed]">account_tree</span>
                  </div>
                  <div className="text-center px-2">
                    <span className="block text-sm font-semibold text-[#e2e2e2]">Asignar Flujo</span>
                  </div>
                </button>

              </div>
            </div>
          )}

          {step === 'editor' && (
            <div className="h-full flex flex-col">
              <div className="flex justify-between gap-3 mb-4">
                
                {/* Toolbar */}
                <div className="flex items-center gap-1 bg-[#27272a] p-1.5 rounded-lg border border-[#3f3f46]">
                  <button onClick={() => document.execCommand('bold')} className="p-1.5 hover:bg-[#333535] rounded text-[#ccc3d8] transition-colors" title="Negrita">
                    <span className="material-symbols-outlined text-[18px]">format_bold</span>
                  </button>
                  <button onClick={() => document.execCommand('italic')} className="p-1.5 hover:bg-[#333535] rounded text-[#ccc3d8] transition-colors" title="Cursiva">
                    <span className="material-symbols-outlined text-[18px]">format_italic</span>
                  </button>
                  <button onClick={() => document.execCommand('underline')} className="p-1.5 hover:bg-[#333535] rounded text-[#ccc3d8] transition-colors" title="Subrayado">
                    <span className="material-symbols-outlined text-[18px]">format_underlined</span>
                  </button>
                  
                  <div className="w-px h-5 bg-[#3f3f46] mx-1"></div>
                  
                  <button onClick={() => document.execCommand('justifyLeft')} className="p-1.5 hover:bg-[#333535] rounded text-[#ccc3d8] transition-colors" title="Alinear Izquierda">
                    <span className="material-symbols-outlined text-[18px]">format_align_left</span>
                  </button>
                  <button onClick={() => document.execCommand('justifyCenter')} className="p-1.5 hover:bg-[#333535] rounded text-[#ccc3d8] transition-colors" title="Centrar">
                    <span className="material-symbols-outlined text-[18px]">format_align_center</span>
                  </button>
                  <button onClick={() => document.execCommand('justifyRight')} className="p-1.5 hover:bg-[#333535] rounded text-[#ccc3d8] transition-colors" title="Alinear Derecha">
                    <span className="material-symbols-outlined text-[18px]">format_align_right</span>
                  </button>

                  <div className="w-px h-5 bg-[#3f3f46] mx-1"></div>

                  <select onChange={(e) => document.execCommand('fontName', false, e.target.value)} className="bg-[#18181b] text-[#ccc3d8] text-sm rounded border border-[#3f3f46] p-1 outline-none">
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier</option>
                  </select>

                  <select onChange={(e) => document.execCommand('fontSize', false, e.target.value)} className="bg-[#18181b] text-[#ccc3d8] text-sm rounded border border-[#3f3f46] p-1 px-2 outline-none">
                    <option value="3">12px</option>
                    <option value="4">14px</option>
                    <option value="5">16px</option>
                    <option value="6">20px</option>
                    <option value="7">24px</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={handleExportPDF}
                    className="px-4 py-2 bg-[#27272a] border border-[#3f3f46] hover:bg-[#303036] text-[#e2e2e2] rounded-lg text-sm transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                    Exportar a PDF
                  </button>
                  <button 
                    onClick={() => setStep('workflow')}
                    className="px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg text-sm transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">send</span>
                    Enviar al Flujo
                  </button>
                </div>
              </div>

              {/* Editor */}
              <div 
                id="document-content-area" 
                className="flex-1 bg-white rounded-lg p-12 text-black shadow-inner overflow-y-auto min-h-[600px]"
              >
                <h1 className="text-2xl font-bold mb-4 outline-none" contentEditable>Título del Documento</h1>
                <div 
                  contentEditable
                  className="outline-none min-h-full"
                  onBlur={(e) => setDocumentContent(e.currentTarget.innerHTML)}
                  dangerouslySetInnerHTML={{ __html: documentContent }}
                />
              </div>
            </div>
          )}

          {step === 'workflow' && (
            <WorkflowBuilderModal onClose={() => setStep('menu')} />
          )}

        </div>
      </div>
    </div>
  );
}
