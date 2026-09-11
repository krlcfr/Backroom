"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Initialize pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface WorkflowNode {
  id: string;
  cargo_id: string;
  assigned_user_id?: string;
  action_required: string;
  cargo?: { nombre: string };
  assigned_user?: { nombre_completo: string, correo: string };
}

interface WorkflowData {
  id: string;
  document_id: string;
  organization_id: string;
  nodes: WorkflowNode[];
}

interface DocumentSignatureCanvasProps {
  workflowData: WorkflowData;
  onFinish: () => void;
  onClose: () => void;
}

interface SignatureBox {
  nodeId: string;
  pageNumber: number;
  xPercent: number;
  yPercent: number;
}

export function DocumentSignatureCanvas({ workflowData, onFinish, onClose }: DocumentSignatureCanvasProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [boxes, setBoxes] = useState<SignatureBox[]>([])
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loadingPdf, setLoadingPdf] = useState(true)
  const [saving, setSaving] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)

  const signNodes = workflowData.nodes.filter(n => n.action_required === 'sign')
  const placedNodeIds = boxes.map(b => b.nodeId)
  const isComplete = signNodes.length > 0 && placedNodeIds.length === signNodes.length

  useEffect(() => {
    async function fetchPdf() {
      try {
        const res = await fetch(`/api/resources/${workflowData.document_id}/download`)
        if (res.ok) {
          const blob = await res.blob()
          const url = URL.createObjectURL(blob)
          setPdfUrl(url)
        }
      } catch (e) {
        console.error("Error loading PDF", e)
      } finally {
        setLoadingPdf(false)
      }
    }
    fetchPdf()
  }, [workflowData.document_id])

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
  }

  const handleDragStart = (e: React.DragEvent, node: WorkflowNode) => {
    e.dataTransfer.setData('application/signature-node', JSON.stringify(node))
    e.dataTransfer.effectAllowed = 'copy'
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!containerRef.current) return

    const nodeStr = e.dataTransfer.getData('application/signature-node')
    if (!nodeStr) return

    const node = JSON.parse(nodeStr) as WorkflowNode

    const rect = containerRef.current.getBoundingClientRect()
    // Calculate percentage relative to the page container
    // Center the 150x60 box on the cursor
    const boxWidthPercent = (150 / rect.width) * 100;
    const boxHeightPercent = (60 / rect.height) * 100;

    let xPercent = ((e.clientX - rect.left) / rect.width) * 100 - (boxWidthPercent / 2);
    let yPercent = ((e.clientY - rect.top) / rect.height) * 100 - (boxHeightPercent / 2);

    // Constrain
    xPercent = Math.max(0, Math.min(xPercent, 90))
    yPercent = Math.max(0, Math.min(yPercent, 95))

    setBoxes(prev => {
      // Remove if this node was already placed somewhere else
      const filtered = prev.filter(b => b.nodeId !== node.id)
      return [...filtered, {
        nodeId: node.id,
        pageNumber: currentPage,
        xPercent,
        yPercent
      }]
    })
  }, [currentPage])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  const removeBox = (nodeId: string) => {
    setBoxes(prev => prev.filter(b => b.nodeId !== nodeId))
  }

  const handleFinalize = async () => {
    if (!isComplete) return
    setSaving(true)

    try {
      // 1. Guardar las posiciones
      const resPos = await fetch(`/api/workflows/${workflowData.id}/signatures/positions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ positions: boxes })
      })

      if (!resPos.ok) {
        throw new Error("Error guardando posiciones")
      }

      // 2. Hacer Submit de la Transacción (Cambia a in_progress)
      const resSub = await fetch(`/api/workflows/${workflowData.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      })

      if (!resSub.ok) {
        throw new Error("Error iniciando flujo")
      }

      alert("¡Flujo iniciado y posiciones guardadas con éxito!")
      onFinish()
    } catch (e: any) {
      alert("Error: " + e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[140] bg-[#121414] flex flex-col animate-in fade-in duration-200">
      {/* Header */}
      <header className="h-16 border-b border-[#3f3f46] bg-[#1a1c1c] flex items-center justify-between px-6 shrink-0">
        <h2 className="text-[18px] font-semibold text-[#e2e2e2] flex items-center gap-2">
          <span className="material-symbols-outlined text-[#7c3aed]">draw</span>
          Ubicar Firmas en el Documento
        </h2>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleFinalize}
            disabled={!isComplete || saving}
            className="px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] disabled:bg-[#3f3f46] disabled:text-[#a1a1aa] disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
          >
            {saving ? (
              <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">send</span>
            )}
            Finalizar y Enviar
          </button>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#333535] text-[#958da1] hover:text-[#e2e2e2] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 border-r border-[#3f3f46] bg-[#18181b] flex flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b border-[#3f3f46]">
            <h3 className="text-sm font-semibold text-white">Firmantes Requeridos ({signNodes.length})</h3>
            <p className="text-xs text-[#a1a1aa] mt-1">Arrastra cada firmante al documento.</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {signNodes.map(node => {
              const isPlaced = placedNodeIds.includes(node.id);
              return (
                <div 
                  key={node.id}
                  draggable={!isPlaced}
                  onDragStart={(e) => handleDragStart(e, node)}
                  className={`border rounded-xl p-3 flex items-center gap-3 transition-colors ${
                    isPlaced 
                      ? 'bg-[#27272a]/50 border-[#3f3f46] opacity-50 cursor-not-allowed' 
                      : 'bg-[#27272a] border-[#7c3aed]/50 hover:border-[#7c3aed] cursor-grab active:cursor-grabbing shadow-lg'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isPlaced ? 'bg-[#3f3f46]' : 'bg-[#7c3aed]/20'}`}>
                    <span className={`material-symbols-outlined text-[16px] ${isPlaced ? 'text-[#a1a1aa]' : 'text-[#d2bbff]'}`}>
                      {isPlaced ? 'check' : 'draw'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">
                      {node.assigned_user?.nombre_completo || node.cargo?.nombre || 'Firmante'}
                    </p>
                    <p className="text-xs text-[#a1a1aa] truncate">
                      {node.assigned_user ? node.cargo?.nombre : 'Cualquiera con este cargo'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </aside>

        {/* Canvas */}
        <main className="flex-1 bg-[#0c0f0f] relative overflow-auto flex flex-col items-center py-8">
          {/* Pagination Controls */}
          <div className="absolute top-4 z-10 flex items-center gap-4 bg-[#27272a] border border-[#3f3f46] rounded-full px-4 py-2 shadow-xl">
            <button 
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="text-[#a1a1aa] hover:text-white disabled:opacity-50"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <span className="text-sm text-[#e2e2e2] font-medium">
              Página {currentPage} de {numPages || '-'}
            </span>
            <button 
              disabled={currentPage >= numPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="text-[#a1a1aa] hover:text-white disabled:opacity-50"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>

          {loadingPdf ? (
            <div className="flex flex-col items-center justify-center h-full text-[#a1a1aa]">
              <span className="material-symbols-outlined animate-spin text-[32px] mb-4">sync</span>
              <p>Cargando documento...</p>
            </div>
          ) : pdfUrl ? (
            <div 
              ref={containerRef}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="relative shadow-2xl transition-transform"
              style={{ width: '800px', minHeight: '1131px', backgroundColor: 'white' }}
            >
              <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
                <Page 
                  pageNumber={currentPage} 
                  renderTextLayer={false} 
                  renderAnnotationLayer={false}
                  width={800} 
                  className="bg-white"
                />
              </Document>

              {/* Render placed signature boxes for this page */}
              {boxes.filter(b => b.pageNumber === currentPage).map(box => {
                const node = signNodes.find(n => n.id === box.nodeId)
                  return (
                    <div 
                      key={box.nodeId}
                      draggable={true}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/signature-node', JSON.stringify(node))
                        e.dataTransfer.effectAllowed = 'copy'
                      }}
                      className="absolute border-2 border-dashed border-[#7c3aed] bg-[#7c3aed]/10 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center group cursor-grab active:cursor-grabbing"
                      style={{
                        left: `${box.xPercent}%`,
                        top: `${box.yPercent}%`,
                        width: '150px',
                        height: '60px'
                      }}
                    >
                    <button 
                      onClick={() => removeBox(box.nodeId)}
                      className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                    <span className="material-symbols-outlined text-[#7c3aed] mb-1">draw</span>
                    <span className="text-[10px] text-[#6d28d9] font-bold truncate w-full px-2 text-center">
                      {node?.assigned_user?.nombre_completo || node?.cargo?.nombre || 'Firma'}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-red-400">
              <span className="material-symbols-outlined text-[32px] mb-2">error</span>
              <p>Error cargando PDF</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
