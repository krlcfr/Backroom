import { createClient } from "@/lib/supabase/server";
import { WorkflowStatusViewer } from "@/components/workflows/WorkflowStatusViewer";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function RecursoViewerPage({ params }: { params: Promise<{ id: string, salaId: string, recursoId: string }> }) {
  const { id, salaId, recursoId } = await params;
  const supabase = await createClient();

  const { data: recurso } = await supabase
    .from("recursos")
    .select("*")
    .eq("id", recursoId)
    .single();

  if (!recurso) {
    notFound();
  }

  // Get signed URL if it's a file
  let finalUrl = recurso.url;
  if (recurso.tipo !== "link" && recurso.tipo !== "youtube") {
    const { data: urlData } = await supabase.storage.from("recursos").createSignedUrl(recurso.url, 3600);
    if (urlData) {
      finalUrl = urlData.signedUrl;
    }
  }

  // Same logic as FloatingViewer
  const getYoutubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  let content;
  if (recurso.tipo === "youtube") {
    const videoId = getYoutubeVideoId(finalUrl);
    const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : finalUrl;
    content = (
      <iframe src={embedUrl} className="w-full h-[600px] rounded-xl border border-[#3f3f46]" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
    );
  } else if (recurso.tipo === "image") {
    content = (
      <div className="w-full h-[600px] flex items-center justify-center p-4 bg-[#18181b] rounded-xl border border-[#3f3f46]">
        <img src={finalUrl} alt={recurso.nombre} className="max-w-full max-h-full object-contain rounded-lg" />
      </div>
    );
  } else if (recurso.tipo === "video") {
    content = (
      <video controls autoPlay className="w-full h-[600px] rounded-xl bg-[#18181b] border border-[#3f3f46]">
        <source src={finalUrl} />
        Tu navegador no soporta el formato de video.
      </video>
    );
  } else if (recurso.tipo === "pdf") {
    content = <iframe src={finalUrl} className="w-full h-[800px] rounded-xl bg-white border border-[#3f3f46]" title={recurso.nombre}></iframe>;
  } else if (recurso.tipo === "archivo" && (recurso.nombre.endsWith(".doc") || recurso.nombre.endsWith(".docx") || recurso.nombre.endsWith(".xls") || recurso.nombre.endsWith(".xlsx") || recurso.nombre.endsWith(".ppt") || recurso.nombre.endsWith(".pptx"))) {
    const gdocsUrl = `https://docs.google.com/gview?url=${encodeURIComponent(finalUrl)}&embedded=true`;
    content = <iframe src={gdocsUrl} className="w-full h-[800px] rounded-xl bg-white border border-[#3f3f46]" title={recurso.nombre}></iframe>;
  } else if (recurso.tipo === "doc") {
    content = <iframe src={finalUrl} className="w-full h-[800px] rounded-xl bg-white border border-[#3f3f46]" title={recurso.nombre}></iframe>;
  } else {
    content = <iframe src={finalUrl} className="w-full h-[800px] rounded-xl bg-white border border-[#3f3f46]" title={recurso.nombre}></iframe>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link 
          href={`/dashboard/backrooms/${id}/salas/${salaId}`}
          className="text-[#958da1] hover:text-white transition-colors flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#27272a]"
        >
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#e2e2e2] flex items-center gap-3">
            {recurso.nombre}
          </h1>
          <p className="text-[#958da1] mt-1 text-sm">
            Tipo: <span className="uppercase text-[#ccc3d8] font-medium">{recurso.tipo}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {content}
        </div>
        <div className="lg:col-span-1">
          {/* Aquí inyectamos el panel de firmas */}
          <WorkflowStatusViewer documentId={recursoId} />
        </div>
      </div>
    </div>
  );
}
