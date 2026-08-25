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
  url: string | null
  x: number
  y: number
  page: number
  usuario_id?: string
  nombre_completo?: string
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
  const [isCreator, setIsCreator] = useState(false)
  
  // Nuevos estados para Flujo Avanzado
  const [roomMembers, setRoomMembers] = useState<{id: string, nombre_completo: string, correo: string}[]>([])
  const [selectedAssignee, setSelectedAssignee] = useState<string>("")
  const [visibilityMode, setVisibilityMode] = useState<string>("sala_completa")
  const [savingVisibility, setSavingVisibility] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const [placeholderToSign, setPlaceholderToSign] = useState<string | null>(null)

  const sigPadRef = useRef<any>(null)

  useEffect(() => {
    async function load() {
      // 1. Cargar datos del recurso
      const { data: recData } = await supabase
        .from("recursos")
        .select("*, salas(backroom_id, backrooms(propietario_id, organization_id))")
        .eq("id", recursoId)
        .single()
      
        if (recData) {
          // Generar URL firmada
          const { data: urlData } = await supabase.storage.from("recursos").createSignedUrl(recData.url, 60 * 60);
          if (urlData?.signedUrl) {
            recData.url = urlData.signedUrl;
          }
          setRecurso(recData)
          setVisibilityMode(recData.visibility_mode || "sala_completa")

          // 2. Cargar perfil
          const { data: { session } } = await supabase.auth.getSession()
          if (session) {
            const { data: perfil } = await supabase.from("usuarios").select("id").eq("auth_id", session.user.id).single()
            if (perfil) {
              setCurrentUserId(perfil.id)
              const isOwn = recData.salas?.backrooms?.propietario_id === perfil.id
              const isCreat = recData.usuario_id === perfil.id
              setIsOwner(isOwn)
              setIsCreator(isCreat)
              
              // Si es owner o creador, cargar miembros del backroom para asignar firmas
              if (isOwn || isCreat) {
                const orgId = recData.salas?.backrooms?.organization_id || (recData.salas as any)?.[0]?.backrooms?.organizacion_id;
                if (orgId) {
                  const { data: miembrosData } = await supabase
                    .from("organization_members")
                    .select("usuarios(id, nombre_completo, correo)")
                    .eq("organization_id", orgId);
                  
                  if (miembrosData) {
                    const parsedMembers = miembrosData.map((m: any) => ({
                      id: m.usuarios.id,
                      nombre_completo: m.usuarios.nombre_completo,
                      correo: m.usuarios.correo
                    }));
                    setRoomMembers(parsedMembers);
                  }
                }
              }
            }
          }
        }

      // 3. Cargar firmas guardadas
      try {
        const res = await fetch(`/api/documents/${recursoId}/signatures`)
        if (res.ok) {
          const { signatures: sigs } = await res.json()
          setSignatures(sigs.map((s: any) => ({
            id: s.id,
            url: s.url,
            x: s.x,
            y: s.y,
            page: s.page,
            usuario_id: s.usuario_id,
            nombre_completo: s.nombre_completo
          })))
        }
      } catch (err) {
        console.error("Error cargando firmas", err)
      }

      setLoading(false)
    }
    load()
  }, [recursoId, supabase])

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
  }

  const handleAddSignature = () => {
    if (!sigPadRef.current?.isEmpty()) {
      const url = sigPadRef.current.getTrimmedCanvas().toDataURL("image/png")
      
      if (placeholderToSign) {
        // Reemplazar el url del placeholder
        setSignatures(signatures.map(s => 
          s.id === placeholderToSign ? { ...s, url } : s
        ))
      } else if (clickMenuPos) {
        // Crear una nueva firma desde cero
        setSignatures([...signatures, {
          id: `temp-${Date.now()}`,
          url,
          x: clickMenuPos.x,
          y: clickMenuPos.y,
          page: pageNumber,
          usuario_id: currentUserId,
          nombre_completo: "Yo"
        }])
      }
      
      setShowSignaturePad(false)
      setClickMenuPos(null)
      setPlaceholderToSign(null)
    }
  }

  const handleSaveSignatures = async () => {
    try {
      const res = await fetch(`/api/documents/${recursoId}/signatures`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signatures })
      })
      if (res.ok) {
        alert("Firmas guardadas exitosamente")
      } else {
        alert("Error al guardar firmas")
      }
    } catch (err) {
      console.error(err)
    }
  }

  const toggleVisibility = async () => {
    const newMode = visibilityMode === "sala_completa" ? "solo_firmantes" : "sala_completa";
    setSavingVisibility(true)
    try {
      const res = await fetch(`/api/documents/${recursoId}/visibility`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility_mode: newMode })
      })
      if (res.ok) {
        setVisibilityMode(newMode)
      } else {
        alert("Error cambiando visibilidad")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSavingVisibility(false)
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

          <div className="w-px h-6 bg-gray-700 mx-2"></div>

          {(isOwner || isCreator) && (
              <>
                <select
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="bg-[#333535] text-sm text-gray-200 rounded px-3 py-1.5 outline-none border border-gray-600 focus:border-purple-500"
              >
                <option value="">A mi mismo (Dueño)</option>
                {roomMembers.map(m => (
                  <option key={m.id} value={m.id}>{m.nombre_completo}</option>
                ))}
              </select>

              <button
                onClick={toggleVisibility}
                disabled={savingVisibility}
                className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded transition-colors ${visibilityMode === 'solo_firmantes' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' : 'hover:bg-[#333535] text-gray-300 border border-transparent'}`}
                title="Alternar visibilidad del documento"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {visibilityMode === 'solo_firmantes' ? 'lock' : 'public'}
                </span>
                {visibilityMode === 'solo_firmantes' ? 'Solo Firmantes' : 'Público'}
              </button>
            </>
          )}

          <div className="w-px h-6 bg-gray-700 mx-2"></div>

          <button onClick={handleSaveSignatures} className="text-sm font-medium px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 transition-colors text-white">
            Guardar Avance
          </button>
          
          {((isOwner || isCreator) || signatures.some(s => s.usuario_id === currentUserId)) && (
            <button onClick={handleFinalize} className="text-sm font-medium px-4 py-1.5 rounded bg-purple-600 hover:bg-purple-500 transition-colors text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]">
              Sellar Documento
            </button>
          )}
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
                  if ((isOwner || isCreator) && selectedAssignee) {
                    // Insertar placeholder para el asignado
                    const selectedMember = roomMembers.find(m => m.id === selectedAssignee)
                    setSignatures([...signatures, {
                      id: `temp-${Date.now()}`,
                      url: null,
                      x: clickMenuPos.x,
                      y: clickMenuPos.y,
                      page: pageNumber,
                      usuario_id: selectedAssignee,
                      nombre_completo: selectedMember?.nombre_completo || "Asignado"
                    }])
                    setClickMenuPos(null)
                  } else {
                    // Firmar a uno mismo
                    setShowSignaturePad(true)
                  }
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-purple-600 hover:text-white rounded-md text-left transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span> {(isOwner || isCreator) && selectedAssignee ? "Asignar Caja de Firma" : "Insertar firma aquí"}
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
                className={`absolute flex flex-col items-center justify-center border-2 border-dashed rounded group z-40 ${
                  sig.url ? "border-purple-500/50 hover:border-purple-500 bg-purple-500/10 cursor-move" : 
                  sig.usuario_id === currentUserId ? "border-green-500 bg-green-500/20 cursor-pointer p-4 w-[150px] h-[100px]" :
                  "border-gray-500 bg-gray-500/20 cursor-not-allowed p-4 w-[150px] h-[100px]"
                }`}
                onClick={(e) => {
                  e.stopPropagation() 
                  if (clickMenuPos) setClickMenuPos(null)
                  if (!sig.url && sig.usuario_id === currentUserId) {
                    setPlaceholderToSign(sig.id)
                    setShowSignaturePad(true)
                  }
                }}
              >
                {sig.url ? (
                  <img src={sig.url} alt="Firma" className="max-w-[150px] pointer-events-none" />
                ) : (
                  <div className="text-center">
                    <span className="material-symbols-outlined text-[24px] mb-1">
                      {sig.usuario_id === currentUserId ? 'draw' : 'lock'}
                    </span>
                    <p className="text-[10px] uppercase font-bold tracking-wider">
                      {sig.usuario_id === currentUserId ? "FIRMA AQUÍ" : `Firma de ${sig.nombre_completo || 'Otro'}`}
                    </p>
                  </div>
                )}

                {((isOwner || isCreator) || sig.usuario_id === currentUserId) && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      setSignatures(signatures.filter(s => s.id !== sig.id))
                    }}
                    className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 rounded-full w-6 h-6 text-white text-xs hidden group-hover:flex items-center justify-center transition-colors"
                  >
                    ✕
                  </button>
                )}
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
                  setPlaceholderToSign(null)
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
