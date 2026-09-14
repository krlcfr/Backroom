"use client"

import { useEffect } from "react"

interface FloatingViewerProps {
  url: string
  tipo: string
  nombre: string
  onClose: () => void
}

export default function FloatingViewer({ url, tipo, nombre, onClose }: FloatingViewerProps) {
  // Prevenir scroll de fondo mientras el modal esté abierto
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [])

  // Extraer el ID de youtube de la url (soporta youtube.com/watch?v=... y youtu.be/...)
  const getYoutubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  const renderContent = () => {
    if (tipo === "youtube") {
      const videoId = getYoutubeVideoId(url);
      const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
      
      return (
        <iframe
          src={embedUrl}
          className="w-full h-full rounded-b-xl"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      )
    }

    if (tipo === "image") {
      return (
        <div className="w-full h-full flex items-center justify-center p-4 bg-[#18181b]">
          <img src={url} alt={nombre} className="max-w-full max-h-full object-contain rounded-lg" />
        </div>
      )
    }

    if (tipo === "video") {
      return (
        <video controls autoPlay className="w-full h-full rounded-b-xl bg-[#18181b]">
          <source src={url} />
          Tu navegador no soporta el formato de video.
        </video>
      )
    }

    if (tipo === "pdf") {
      return (
        <iframe src={url} className="w-full h-full rounded-b-xl bg-white border-0" title={nombre}></iframe>
      )
    }

    // Si es un documento de office (docx, xlsx, pptx) u otro, intentar con Google Docs Viewer
    if (tipo === "archivo" && (nombre.endsWith(".doc") || nombre.endsWith(".docx") || nombre.endsWith(".xls") || nombre.endsWith(".xlsx") || nombre.endsWith(".ppt") || nombre.endsWith(".pptx"))) {
      const gdocsUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
      return (
        <iframe src={gdocsUrl} className="w-full h-full rounded-b-xl bg-white border-0" title={nombre}></iframe>
      )
    }

    // Fallback genérico para iframes (enlaces externos)
    return (
      <iframe src={url} className="w-full h-full rounded-b-xl bg-white border-0" title={nombre}></iframe>
    )
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-10">
      {/* Clicker para cerrar al tocar el fondo */}
      <div className="absolute inset-0 z-0" onClick={onClose} />
      
      <div className="relative z-10 w-full max-w-5xl bg-[#1e2020] border border-[#3f3f46] rounded-xl shadow-2xl flex flex-col" style={{ height: '80vh' }}>
        <div className="flex items-center justify-between p-4 border-b border-[#3f3f46]">
          <h3 className="text-[#e2e2e2] font-semibold truncate pr-4">{nombre}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#333535] hover:bg-[#4a4455] text-[#ccc3d8] transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        
        <div className="flex-1 w-full relative">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}
