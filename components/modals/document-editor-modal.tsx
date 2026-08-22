"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Document, Page, pdfjs } from "react-pdf"
import SignatureCanvas from "react-signature-canvas"
import Draggable from "react-draggable"
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface Recurso {
  id: string
  nombre: string
  url: string
}

interface SignatureLayer {
  id: string
  url: string
  x: number
  y: number
  page: number
}

interface DocumentEditorModalProps {
  recursoId: string
  onClose: () => void
}

export function DocumentEditorModal({ recursoId, onClose }: DocumentEditorModalProps) {
  const supabase = createClient()
  
  const [recurso, setRecurso] = useState<Recurso | null>(null)
  const [numPages, setNumPages] = useState<number>(1)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [showSignaturePad, setShowSignaturePad] = useState(false)
  const [signatures, setSignatures] = useState<SignatureLayer[]>([])
  const [loading, setLoading] = useState(true)
  const [clickMenuPos, setClickMenuPos] = useState<{x: number, y: number} | null>(null)
  const [isOwner, setIsOwner] = useState(false)

  const sigPadRef = useRef<any>(null)

  useEffect(() => {
    async function load() {
      // 1. Cargar datos del recurso
      const { data: recData } = await supabase
        .from("recursos")
        .select("*, salas(backroom_id, backrooms(propietario_id))")
        .eq("id", recursoId)
        .single()
      
      if (recData) {
        // Generar URL firmada para poder renderizar el PDF
        const { data: urlData } = await supabase.storage.from("recursos").createSignedUrl(recData.url, 60 * 60);
        if (urlData?.signedUrl) {
          recData.url = urlData.signedUrl;
        }
        
        setRecurso(recData)
        // 2. Cargar perfil para saber si es el owner
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          const { data: perfil } = await supabase.from("usuarios").select("id").eq("auth_id", session.user.id).single()
          if (perfil) {
            setIsOwner(recData.salas?.backrooms?.propietario_id === perfil.id)
          }
        }
      }

      // 3. Cargar firmas guardadas
      try {
        const res = await fetch(`/api/documents/${recursoId}/signatures`)
        if (res.ok) {
          const { signatures: dbSigs } = await res.json()
          setSignatures(dbSigs)
        }
      } catch (err) {
        console.error("Error al cargar firmas", err)
      }

      setLoading(false)
    }
    load()
  }, [recursoId, supabase])

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
  }

  const handleAddSignature = () => {
    if (sigPadRef.current?.isEmpty()) return
    const signatureDataUrl = sigPadRef.current?.getTrimmedCanvas().toDataURL('image/png')
    
    setSignatures([...signatures, {
      id: crypto.randomUUID(),
      url: signatureDataUrl,
      x: clickMenuPos ? clickMenuPos.x - 75 : 100, // Centro aproximado de la firma
      y: clickMenuPos ? clickMenuPos.y - 25 : 100,
      page: pageNumber
    }])
    setShowSignaturePad(false)
    setClickMenuPos(null)
  }

  const handleSaveSignatures = async () => {
    try {
      const res = await fetch(`/api/documents/${recursoId}/signatures`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signatures })
      })
      if (!res.ok) throw new Error("Error al guardar")
      alert("Firmas guardadas exitosamente en la base de datos.")
    } catch (err) {
      alert("Hubo un problema al guardar las firmas.")
    }
  }

  const handleFinalize = async () => {
    if (!confirm("¿Estás seguro de que quieres sellar el documento? Esto quemará las firmas de forma permanente y ya no se podrán mover ni editar.")) return;
    
    try {
      const res = await fetch(`/api/documents/${recursoId}/finalize`, {
        method: "POST"
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Error al sellar")
      }
      alert("¡Documento sellado criptográficamente con éxito!")
      onClose() // Cerramos el modal
    } catch (err) {
      alert(err instanceof Error ? err.message : "Hubo un error al sellar el documento")
    }
  }

  // Interceptar clic izquierdo en el PDF para mostrar un menú flotante en esa posición
  const handlePdfClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Evitamos que salte si estamos arrastrando una firma o si hacemos clic en botones
    if ((e.target as HTMLElement).closest('.react-draggable') || (e.target as HTMLElement).tagName === 'BUTTON') {
      return;
    }
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Mostramos el menú contextual simulado (clic izquierdo)
    setClickMenuPos({ x, y });
  }

  if (loading) return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center text-white">
      <p>Cargando documento...</p>
    </div>
  )
  
  if (!recurso) return null

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col h-screen overflow-hidden text-white backdrop-blur-sm">
      {/* Top Bar Zen */}
      <div className="h-16 border-b border-gray-800 bg-[#121414] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-[#333535] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-purple-500">description</span>
            <h1 className="font-semibold">{recurso.nombre}</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            disabled={pageNumber <= 1} 
            onClick={() => setPageNumber(p => p - 1)}
            className="text-sm px-3 py-1.5 rounded hover:bg-[#333535] text-gray-300 disabled:opacity-50 transition-colors"
          >
            Anterior
          </button>
          <span className="text-sm">Página {pageNumber} de {numPages}</span>
          <button 
            disabled={pageNumber >= numPages} 
            onClick={() => setPageNumber(p => p + 1)}
            className="text-sm px-3 py-1.5 rounded hover:bg-[#333535] text-gray-300 disabled:opacity-50 transition-colors"
          >
            Siguiente
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleSaveSignatures} 
            className="flex items-center px-4 py-2 text-[13px] font-medium rounded-lg border border-gray-700 bg-transparent hover:bg-gray-800 text-gray-300 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] mr-2">save</span>
            Guardar
          </button>
          <button 
            onClick={handleFinalize} 
            className="flex items-center px-4 py-2 text-[13px] font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] mr-2">verified</span>
            Sellar Documento
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div 
        className="flex-1 overflow-auto bg-[#0a0a0a] p-8 flex justify-center relative"
        onClick={() => {
          // Si hace clic fuera del PDF, ocultamos el menú
          if (clickMenuPos) setClickMenuPos(null)
        }}
      >
        <div 
          className="relative inline-block bg-white shadow-2xl cursor-crosshair transition-transform"
          onClick={(e) => {
            e.stopPropagation()
            handlePdfClick(e)
          }}
        >
          {/* El documento base */}
          <Document 
            file={recurso.url} 
            onLoadSuccess={onDocumentLoadSuccess}
            className="max-w-full select-none"
            loading={<div className="p-20 text-gray-500 flex justify-center items-center">Renderizando PDF...</div>}
          >
            <Page 
              pageNumber={pageNumber} 
              width={800} // Fijo para hacer más fácil el cálculo de coordenadas X/Y
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>

          {/* Menú Flotante del Clic Izquierdo */}
          {clickMenuPos && (
            <div 
              className="absolute z-50 bg-[#1a1d1d] border border-gray-700 rounded-lg shadow-xl p-1 flex flex-col gap-1 w-48 animate-in fade-in zoom-in-95 duration-100"
              style={{ top: clickMenuPos.y, left: clickMenuPos.x }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => {
                  setShowSignaturePad(true)
                  // No borramos la posicion todavía para saber donde ponerla
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-purple-600 hover:text-white rounded-md text-left transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span> Insertar firma aquí
              </button>
            </div>
          )}

          {/* Capas superpuestas de firmas (Stickers) */}
          {signatures.filter(s => s.page === pageNumber).map((sig) => (
            <Draggable
              key={sig.id}
              defaultPosition={{ x: sig.x, y: sig.y }}
              bounds="parent"
              onStop={(e, data) => {
                const updated = signatures.map(s => 
                  s.id === sig.id ? { ...s, x: data.x, y: data.y } : s
                )
                setSignatures(updated)
              }}
            >
              <div 
                className="absolute cursor-move border-2 border-dashed border-purple-500/50 hover:border-purple-500 bg-purple-500/10 rounded group z-40"
                onClick={(e) => {
                  e.stopPropagation() // Evitar que salga el menú de clic al hacer clic en la firma
                  if (clickMenuPos) setClickMenuPos(null)
                }}
              >
                <img src={sig.url} alt="Firma" className="max-w-[150px] pointer-events-none" />
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    setSignatures(signatures.filter(s => s.id !== sig.id))
                  }}
                  className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 rounded-full w-6 h-6 text-white text-xs hidden group-hover:flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>
            </Draggable>
          ))}
        </div>
      </div>

      {/* Modal de Firma */}
      {showSignaturePad && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[110]">
          <div className="bg-[#1a1d1d] p-6 rounded-xl w-full max-w-md border border-gray-800 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4 text-white">Dibuja tu firma</h3>
            <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 overflow-hidden cursor-crosshair">
              <SignatureCanvas 
                ref={sigPadRef}
                canvasProps={{ className: 'w-full h-48 signature-canvas' }}
                penColor="black"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => {
                  sigPadRef.current?.clear()
                  setShowSignaturePad(false)
                  setClickMenuPos(null)
                }}
                className="px-4 py-2 text-[13px] font-medium rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => sigPadRef.current?.clear()} 
                className="px-4 py-2 text-[13px] font-medium rounded-lg border border-gray-700 hover:bg-gray-800 text-gray-300 transition-colors"
              >
                Limpiar
              </button>
              <button 
                onClick={handleAddSignature} 
                className="px-4 py-2 text-[13px] font-medium rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-colors"
              >
                Guardar e Insertar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
