"use client"

import { useState, useRef, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface PerfilConfigClientProps {
  userId: string;
  initialSignatureUrl: string | null;
  authId: string;
}

export default function PerfilConfigClient({ userId, initialSignatureUrl, authId }: PerfilConfigClientProps) {
  const [signatureUrl, setSignatureUrl] = useState<string | null>(initialSignatureUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<'draw' | 'upload'>('draw');
  const [file, setFile] = useState<File | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && mode === 'draw') {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000000'; // Draw in black so it looks like ink on paper
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [mode]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsDrawing(true);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    
    try {
      let finalFile: Blob | null = null;
      let fileExt = 'png';

      if (mode === 'upload' && file) {
        finalFile = file;
        fileExt = file.name.split('.').pop() || 'png';
      } else if (mode === 'draw' && canvasRef.current) {
        // Convert canvas to blob
        finalFile = await new Promise<Blob | null>(resolve => {
          canvasRef.current?.toBlob(blob => resolve(blob), 'image/png');
        });
      }

      if (!finalFile) {
        throw new Error("Por favor dibuja tu firma o selecciona una imagen.");
      }

      const filePath = `${authId}/signature_${Date.now()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('signatures')
        .upload(filePath, finalFile, {
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Update usuario profile
      const { error: dbError } = await supabase
        .from('usuarios')
        .update({ visual_signature_url: filePath })
        .eq('id', userId);

      if (dbError) throw dbError;

      setSignatureUrl(filePath);
      alert("Firma guardada correctamente.");
      router.refresh();

    } catch (err: any) {
      setError(err.message || "Error al guardar la firma.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {signatureUrl ? (
        <div className="p-4 bg-[#27272a] rounded-lg border border-[#3f3f46]">
          <h3 className="text-sm font-semibold text-[#e2e2e2] mb-4">Tu firma actual</h3>
          <div className="w-full max-w-sm h-40 bg-white rounded-lg flex items-center justify-center p-2">
            <img 
              src={supabase.storage.from('signatures').getPublicUrl(signatureUrl).data.publicUrl} 
              alt="Firma actual" 
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <button 
            onClick={() => setSignatureUrl(null)}
            className="mt-4 px-4 py-2 bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30 rounded-lg text-sm font-semibold hover:bg-[#ef4444]/20 transition-colors"
          >
            Reemplazar firma
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2 p-1 bg-[#27272a] rounded-lg w-fit">
            <button 
              onClick={() => setMode('draw')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'draw' ? 'bg-[#3f3f46] text-[#e2e2e2]' : 'text-[#958da1]'}`}
            >
              Dibujar Firma
            </button>
            <button 
              onClick={() => setMode('upload')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'upload' ? 'bg-[#3f3f46] text-[#e2e2e2]' : 'text-[#958da1]'}`}
            >
              Subir Imagen
            </button>
          </div>

          {mode === 'draw' && (
            <div className="space-y-2">
              <div className="w-full max-w-sm h-48 bg-white rounded-lg border-2 border-dashed border-[#7c3aed]/50 overflow-hidden relative cursor-crosshair">
                <canvas 
                  ref={canvasRef}
                  width={384} // max-w-sm is 384px
                  height={192} // h-48 is 192px
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-full touch-none"
                />
              </div>
              <button 
                onClick={clearCanvas}
                className="text-xs text-[#958da1] hover:text-[#e2e2e2] transition-colors"
              >
                Limpiar lienzo
              </button>
            </div>
          )}

          {mode === 'upload' && (
            <div className="w-full max-w-sm">
              <label className="block text-sm font-medium text-[#ccc3d8] mb-2">Seleccionar archivo PNG</label>
              <input 
                type="file" 
                accept="image/png"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-[#958da1] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#7c3aed]/10 file:text-[#d2bbff] hover:file:bg-[#7c3aed]/20"
              />
              <p className="text-xs text-[#958da1] mt-2">Recomendado: Imagen PNG con fondo transparente.</p>
            </div>
          )}

          {error && <p className="text-sm text-[#ef4444]">{error}</p>}

          <button 
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-[#7c3aed] text-white rounded-lg text-sm font-semibold hover:bg-[#6d28d9] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span> : null}
            {loading ? "Guardando..." : "Guardar Firma"}
          </button>
        </div>
      )}
    </div>
  );
}
