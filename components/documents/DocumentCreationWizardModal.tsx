"use client";

import { useState, useEffect, useRef } from "react";
import { PDFService } from "@/lib/services/pdf.service";
import { WorkflowBuilderModal } from "@/components/workflows/WorkflowBuilderModal";

interface DocumentCreationWizardModalProps {
  onClose: () => void;
  orgId: string;
  roomId?: string;
  onAddResource?: (type: 'doc' | 'pdf' | 'media' | 'link') => void;
  editResource?: any;
}

type Step = 'menu' | 'editor' | 'workflow';

export function DocumentCreationWizardModal({ onClose, orgId, roomId, onAddResource, editResource }: DocumentCreationWizardModalProps) {
  const [step, setStep] = useState<Step>(editResource ? 'editor' : 'menu');
  const [documentContent, setDocumentContent] = useState("<p>Comienza a escribir tu documento...</p>");
  const [savedDocumentId, setSavedDocumentId] = useState<string | null>(editResource?.id || null);
  const [documentTitle, setDocumentTitle] = useState(editResource?.nombre || "Nuevo_Documento");

  // Annotations state
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);
  const [floatingBtnPos, setFloatingBtnPos] = useState<{ top: number, left: number } | null>(null);
  const [draftAnnotation, setDraftAnnotation] = useState<{ id: string, quote: string, comment: string } | null>(null);

  useEffect(() => {
    if (editResource && editResource.signedUrl) {
      fetch(editResource.signedUrl)
        .then(res => res.text())
        .then(html => {
          const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
          if (bodyMatch && bodyMatch[1]) {
            setDocumentContent(bodyMatch[1]);
          } else {
            setDocumentContent(html);
          }
        })
        .catch(err => console.error("Error cargando HTML:", err));
    }
  }, [editResource]);

  // Load annotations when savedDocumentId exists
  useEffect(() => {
    if (savedDocumentId && roomId) {
      fetch(`/api/rooms/${roomId}/resources/${savedDocumentId}/annotations`)
        .then(res => res.json())
        .then(data => {
          if (data.data) setAnnotations(data.data);
        })
        .catch(err => console.error("Error loading annotations:", err));
    }
  }, [savedDocumentId, roomId]);

  // Add click listeners to marks after content renders
  useEffect(() => {
    const marks = document.querySelectorAll('mark[data-annotation-id]');
    marks.forEach(mark => {
      // Remove old listeners to avoid duplicates
      const newMark = mark.cloneNode(true) as HTMLElement;
      mark.parentNode?.replaceChild(newMark, mark);
      
      newMark.addEventListener('click', () => {
        const id = newMark.getAttribute('data-annotation-id');
        if (id) handleMarkClick(id);
      });
    });
  }, [documentContent, annotations]);

  const handleMarkClick = (id: string) => {
    setShowAnnotations(true);
    // Scroll the sidebar to this annotation
    setTimeout(() => {
      const el = document.getElementById(`annotation-${id}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0 && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      
      const editorArea = document.getElementById('document-editor-container');
      if (editorArea && editorArea.contains(range.commonAncestorContainer)) {
        const rect = range.getBoundingClientRect();
        
        setSelectionRange(range);
        setFloatingBtnPos({
          top: rect.top - 45,
          left: rect.left + rect.width / 2 - 20
        });
        return;
      }
    }
    setFloatingBtnPos(null);
  };

  const handleAddCommentClick = () => {
    if (!selectionRange) return;
    if (!savedDocumentId) {
      alert("Primero debes guardar el documento antes de añadir comentarios.");
      return;
    }
    
    const newId = crypto.randomUUID();
    const quote = selectionRange.toString();
    
    const mark = document.createElement('mark');
    mark.className = 'bg-yellow-200/60 cursor-pointer border-b-2 border-yellow-400 rounded-sm';
    mark.setAttribute('data-annotation-id', newId);
    
    try {
      selectionRange.surroundContents(mark);
    } catch (e) {
      console.error(e);
      alert("Selección demasiado compleja. Intenta seleccionar texto sin saltos de línea ni otros formatos cruzados.");
      return;
    }
    
    const editor = document.getElementById('document-editor-container');
    if (editor) {
      setDocumentContent(editor.innerHTML);
    }
    
    setDraftAnnotation({ id: newId, quote, comment: "" });
    setShowAnnotations(true);
    setFloatingBtnPos(null);
    window.getSelection()?.removeAllRanges();

    // Guardar los cambios del mark en DB
    handleSaveDB(false);
  };

  const submitDraftAnnotation = async () => {
    if (!draftAnnotation || !draftAnnotation.comment.trim() || !savedDocumentId || !roomId) return;

    try {
      const res = await fetch(`/api/rooms/${roomId}/resources/${savedDocumentId}/annotations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: draftAnnotation.id,
          quote: draftAnnotation.quote,
          comment: draftAnnotation.comment
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAnnotations([...annotations, data.data]);
        setDraftAnnotation(null);
      } else {
        alert("Error al guardar anotación");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveDB = async (showAlert = true) => {
    if (!roomId) {
      alert("Error: No se encontró la sala.");
      return;
    }
    
    let currentHtml = documentContent;
    const editor = document.getElementById('document-editor-container');
    if (editor) {
      currentHtml = editor.innerHTML;
      setDocumentContent(currentHtml);
    }

    const titleElement = document.querySelector('#document-editor-container h1');
    const docName = titleElement?.textContent || "Nuevo_Documento";
    setDocumentTitle(docName);

    try {
      let res;
      if (savedDocumentId) {
        res = await fetch(`/api/rooms/${roomId}/resources/${savedDocumentId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: currentHtml, isHTML: true, nombre: docName })
        });
      } else {
        res = await fetch(`/api/rooms/${roomId}/resources/create-document`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre: docName, content: currentHtml, isHTML: true })
        });
      }
      
      if (res.ok) {
        const data = await res.json();
        if (!savedDocumentId && data.resource?.id) {
          setSavedDocumentId(data.resource.id);
        }
        if (showAlert) alert("Documento guardado exitosamente en Backroom.");
      } else {
        if (showAlert) {
          const err = await res.json();
          alert("Error al guardar: " + (err.error || "Desconocido"));
        }
      }
    } catch (error) {
      console.error(error);
      if (showAlert) alert("Error al guardar en BD");
    }
  };

  const handleExportPDF = async () => {
    try {
      await PDFService.exportElementToPDF('document-editor-container', 'Nuevo_Documento.pdf');
    } catch (error) {
      console.error(error);
      alert("Error al exportar PDF");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[110] backdrop-blur-sm">
      <div className={`bg-[#121414] ${showAnnotations ? 'w-[95vw]' : 'w-full max-w-4xl'} h-[85vh] rounded-2xl border border-[#3f3f46] shadow-2xl flex flex-col overflow-hidden transition-all duration-300`}>
        
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
          <div className="flex items-center gap-4">
            {step === 'editor' && (
              <button 
                onClick={() => setShowAnnotations(!showAnnotations)}
                className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${showAnnotations ? 'bg-[#7c3aed]/20 text-[#d2bbff]' : 'text-[#958da1] hover:bg-[#27272a] hover:text-[#e2e2e2]'}`}
              >
                <span className="material-symbols-outlined text-[18px]">comment</span>
                {annotations.length + (draftAnnotation ? 1 : 0)} Comentarios
              </button>
            )}
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#333535] text-[#958da1] hover:text-[#e2e2e2] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex relative">
          
          {step === 'menu' && (
            <div className="max-w-2xl mx-auto h-full flex flex-col justify-center overflow-y-auto w-full p-8">
              <h3 className="text-[24px] font-semibold text-center mb-8 text-[#e2e2e2]">
                ¿Qué tipo de recurso deseas añadir?
              </h3>
              
              <div className="grid grid-cols-3 gap-6 max-w-[600px] mx-auto">
                <button onClick={() => setStep('editor')} className="w-full h-44 bg-[#27272a] hover:bg-[#303036] border border-[#3f3f46] hover:border-[#7c3aed] rounded-xl flex flex-col items-center justify-center gap-4 transition-all group">
                  <div className="w-12 h-12 rounded-full bg-[#18181b] group-hover:bg-[#3b0764] flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-[24px] text-[#7c3aed]">edit_document</span>
                  </div>
                  <div className="text-center px-2">
                    <span className="block text-sm font-semibold text-[#e2e2e2]">Crear Documento</span>
                  </div>
                </button>

                <button onClick={() => onAddResource && onAddResource('doc')} className="w-full h-44 bg-[#27272a] hover:bg-[#303036] border border-[#3f3f46] hover:border-[#7c3aed] rounded-xl flex flex-col items-center justify-center gap-4 transition-all group">
                  <div className="w-12 h-12 rounded-full bg-[#18181b] group-hover:bg-[#3b0764] flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-[24px] text-[#7c3aed]">description</span>
                  </div>
                  <div className="text-center px-2">
                    <span className="block text-sm font-semibold text-[#e2e2e2]">Subir Doc / Txt</span>
                  </div>
                </button>

                <button onClick={() => onAddResource && onAddResource('pdf')} className="w-full h-44 bg-[#27272a] hover:bg-[#303036] border border-[#3f3f46] hover:border-[#7c3aed] rounded-xl flex flex-col items-center justify-center gap-4 transition-all group">
                  <div className="w-12 h-12 rounded-full bg-[#18181b] group-hover:bg-[#3b0764] flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-[24px] text-[#7c3aed]">picture_as_pdf</span>
                  </div>
                  <div className="text-center px-2">
                    <span className="block text-sm font-semibold text-[#e2e2e2]">Subir PDF</span>
                  </div>
                </button>

                <button onClick={() => onAddResource && onAddResource('media')} className="w-full h-44 bg-[#27272a] hover:bg-[#303036] border border-[#3f3f46] hover:border-[#7c3aed] rounded-xl flex flex-col items-center justify-center gap-4 transition-all group">
                  <div className="w-12 h-12 rounded-full bg-[#18181b] group-hover:bg-[#3b0764] flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-[24px] text-[#7c3aed]">play_circle</span>
                  </div>
                  <div className="text-center px-2">
                    <span className="block text-sm font-semibold text-[#e2e2e2]">Audio / Video</span>
                  </div>
                </button>

                <button onClick={() => onAddResource && onAddResource('link')} className="w-full h-44 bg-[#27272a] hover:bg-[#303036] border border-[#3f3f46] hover:border-[#7c3aed] rounded-xl flex flex-col items-center justify-center gap-4 transition-all group">
                  <div className="w-12 h-12 rounded-full bg-[#18181b] group-hover:bg-[#3b0764] flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-[24px] text-[#7c3aed]">link</span>
                  </div>
                  <div className="text-center px-2">
                    <span className="block text-sm font-semibold text-[#e2e2e2]">Añadir Enlace</span>
                  </div>
                </button>

                <button 
                  onClick={() => savedDocumentId ? setStep('workflow') : alert("Primero debes guardar un documento para asignarle un flujo.")}
                  className={`w-full h-44 border rounded-xl flex flex-col items-center justify-center gap-4 transition-all group ${savedDocumentId ? 'bg-[#27272a] hover:bg-[#303036] border-[#3f3f46] hover:border-[#7c3aed] cursor-pointer' : 'bg-[#18181b] border-[#27272a] opacity-50 cursor-not-allowed'}`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${savedDocumentId ? 'bg-[#18181b] group-hover:bg-[#3b0764]' : 'bg-[#121414]'}`}>
                    <span className={`material-symbols-outlined text-[24px] ${savedDocumentId ? 'text-[#7c3aed]' : 'text-[#3f3f46]'}`}>account_tree</span>
                  </div>
                  <div className="text-center px-2">
                    <span className={`block text-sm font-semibold ${savedDocumentId ? 'text-[#e2e2e2]' : 'text-[#3f3f46]'}`}>Asignar Flujo</span>
                  </div>
                </button>

              </div>
            </div>
          )}

          {step === 'editor' && (
            <div className="flex-1 flex flex-col p-8 overflow-y-auto" onMouseUp={handleSelection}>
              <div className="flex justify-between gap-3 mb-4 sticky top-0 z-10 bg-[#121414] pb-2">
                
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
                    <option value="Courier New">Courier New</option>
                  </select>

                  <select onChange={(e) => document.execCommand('fontSize', false, e.target.value)} className="bg-[#18181b] text-[#ccc3d8] text-sm rounded border border-[#3f3f46] p-1 px-2 outline-none">
                    <option value="3">12px</option>
                    <option value="4">14px</option>
                    <option value="5">16px</option>
                    <option value="6">20px</option>
                    <option value="7">24px</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      const printWindow = window.open('', '', 'width=800,height=600');
                      if (printWindow) {
                        printWindow.document.write('<html><head><title>Imprimir</title></head><body style="padding: 40px; font-family: sans-serif;">');
                        printWindow.document.write(documentContent);
                        printWindow.document.write('</body></html>');
                        printWindow.document.close();
                        printWindow.focus();
                        printWindow.print();
                        printWindow.close();
                      }
                    }}
                    className="p-2 bg-[#27272a] border border-[#3f3f46] hover:bg-[#303036] text-[#ccc3d8] rounded-lg text-sm transition-colors flex items-center"
                    title="Imprimir"
                  >
                    <span className="material-symbols-outlined text-[18px]">print</span>
                  </button>
                  
                  <div className="relative group">
                    <button className="px-4 py-2 bg-[#27272a] border border-[#3f3f46] hover:bg-[#303036] text-[#e2e2e2] rounded-lg text-sm transition-colors flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">save</span>
                      Guardar
                    </button>
                    <div className="absolute top-full right-0 mt-1 w-48 bg-[#18181b] border border-[#3f3f46] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 overflow-hidden">
                      <button onClick={handleExportPDF} className="w-full text-left px-4 py-2 text-sm text-[#e2e2e2] hover:bg-[#27272a] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">download</span>
                        Descargar (Local)
                      </button>
                      <button onClick={() => handleSaveDB(true)} className="w-full text-left px-4 py-2 text-sm text-[#e2e2e2] hover:bg-[#27272a] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                        Guardar en Backroom
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={() => savedDocumentId ? setStep('workflow') : alert("Primero debes guardar el documento (botón 'Guardar en Backroom') para asignarle un flujo.")}
                    className={`px-4 py-2 text-white rounded-lg text-sm transition-colors flex items-center gap-2 ${savedDocumentId ? 'bg-[#7c3aed] hover:bg-[#6d28d9]' : 'bg-[#3f3f46] cursor-not-allowed opacity-50'}`}
                    title={savedDocumentId ? "Asignar Flujo" : "Guarda el documento primero"}
                  >
                    <span className="material-symbols-outlined text-[16px]">send</span>
                    Asignar Flujo
                  </button>
                </div>
              </div>

              {/* Contenedor del Editor */}
              <div className="flex-1 flex justify-center">
                <div 
                  id="document-editor-container" 
                  className="bg-white rounded-lg p-12 text-black shadow-inner min-h-[700px] w-full max-w-3xl"
                >
                  <h1 className="text-2xl font-bold mb-4 outline-none" contentEditable suppressContentEditableWarning>Título del Documento</h1>
                  <div 
                    contentEditable
                    className="outline-none min-h-full leading-relaxed"
                    onBlur={(e) => {
                      if (e.relatedTarget && (e.relatedTarget as HTMLElement).closest('.annotation-ui')) {
                        // ignore blur if clicking on floating button
                        return;
                      }
                      setDocumentContent(e.currentTarget.innerHTML);
                    }}
                    dangerouslySetInnerHTML={{ __html: documentContent }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Sidebar de Anotaciones */}
          {step === 'editor' && showAnnotations && (
            <aside className="w-80 border-l border-[#3f3f46] bg-[#18181b] p-4 flex flex-col gap-4 overflow-y-auto shrink-0 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between pb-2 border-b border-[#3f3f46]">
                <h3 className="text-sm font-semibold text-[#e2e2e2] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#7c3aed] text-[18px]">forum</span>
                  Comentarios
                </h3>
              </div>
              
              <div className="flex flex-col gap-4 flex-1">
                {draftAnnotation && (
                  <div className="bg-[#27272a] border border-[#7c3aed] rounded-xl p-3 shadow-lg">
                    <p className="text-xs text-[#958da1] mb-2 italic border-l-2 border-yellow-400 pl-2 line-clamp-3">
                      "{draftAnnotation.quote}"
                    </p>
                    <textarea 
                      autoFocus
                      className="w-full bg-[#18181b] border border-[#3f3f46] rounded-lg p-2 text-sm text-[#e2e2e2] outline-none focus:border-[#7c3aed] resize-none h-20"
                      placeholder="Escribe tu comentario..."
                      value={draftAnnotation.comment}
                      onChange={(e) => setDraftAnnotation({ ...draftAnnotation, comment: e.target.value })}
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button 
                        onClick={() => {
                          // Remover mark si cancela
                          const editor = document.getElementById('document-editor-container');
                          const mark = editor?.querySelector(`mark[data-annotation-id="${draftAnnotation.id}"]`);
                          if (mark) {
                            mark.replaceWith(document.createTextNode(mark.textContent || ''));
                            setDocumentContent(editor?.innerHTML || documentContent);
                          }
                          setDraftAnnotation(null);
                        }}
                        className="px-3 py-1.5 text-xs font-medium text-[#ccc3d8] hover:bg-[#333535] rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={submitDraftAnnotation}
                        className="px-3 py-1.5 text-xs font-medium bg-[#7c3aed] text-white hover:bg-[#6d28d9] rounded-lg transition-colors"
                      >
                        Comentar
                      </button>
                    </div>
                  </div>
                )}

                {annotations.map(ann => (
                  <div key={ann.id} id={`annotation-${ann.id}`} className="bg-[#27272a] border border-[#3f3f46] rounded-xl p-3 hover:border-[#4a4455] transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      {ann.usuarios?.avatar_url ? (
                        <img src={ann.usuarios.avatar_url} alt="" className="w-5 h-5 rounded-full object-cover" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-[#3b0764] flex items-center justify-center">
                          <span className="material-symbols-outlined text-[12px] text-[#d2bbff]">person</span>
                        </div>
                      )}
                      <span className="text-xs font-semibold text-[#e2e2e2] truncate flex-1">
                        {ann.usuarios?.nombre_completo || "Usuario"}
                      </span>
                      <span className="text-[10px] text-[#958da1]">
                        {new Date(ann.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-[#958da1] mb-2 italic border-l-2 border-yellow-400 pl-2">
                      "{ann.quote}"
                    </p>
                    <p className="text-sm text-[#e2e2e2] whitespace-pre-wrap">
                      {ann.comment}
                    </p>
                  </div>
                ))}

                {!draftAnnotation && annotations.length === 0 && (
                  <div className="text-center py-12 text-[#958da1]">
                    <span className="material-symbols-outlined text-[48px] mb-2 opacity-50">format_quote</span>
                    <p className="text-sm">No hay comentarios aún.</p>
                    <p className="text-xs mt-1">Selecciona texto en el documento para añadir uno.</p>
                  </div>
                )}
              </div>
            </aside>
          )}

          {step === 'workflow' && savedDocumentId && (
            <WorkflowBuilderModal 
              orgId={orgId}
              documentId={savedDocumentId}
              documentTitle={documentTitle}
              onClose={() => setStep(editResource ? 'editor' : 'menu')}
              onSaveWorkflow={() => {
                onClose();
                window.location.reload();
              }}
            />
          )}

        </div>
      </div>
      
      {/* Botón flotante para comentar */}
      {floatingBtnPos && (
        <button
          className="annotation-ui absolute z-[150] flex items-center gap-1 bg-[#27272a] border border-[#3f3f46] rounded-full px-3 py-1.5 shadow-xl hover:bg-[#303036] hover:border-[#7c3aed] text-[#e2e2e2] transition-all cursor-pointer animate-in fade-in zoom-in-95 duration-150"
          style={{ top: floatingBtnPos.top, left: floatingBtnPos.left }}
          onClick={handleAddCommentClick}
          onMouseDown={(e) => e.preventDefault()} // prevent blur
        >
          <span className="material-symbols-outlined text-[16px] text-[#7c3aed]">add_comment</span>
          <span className="text-xs font-medium">Comentar</span>
        </button>
      )}
    </div>
  );
}
