import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { createPortal } from 'react-dom';

export default function DocumentStatusModal({ recurso, onClose }: { recurso: any, onClose: () => void }) {
  const [firmas, setFirmas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadFirmas() {
      const { data } = await supabase.from('document_signatures').select('*, usuarios(nombre_completo, correo)').eq('recurso_id', recurso.id);
      setFirmas(data || []);
      setLoading(false);
    }
    loadFirmas();
  }, [recurso.id, supabase]);

  const isSealed = !loading && firmas.length === 0;

  return createPortal(
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4'>
      <div className='bg-[#18181b] border border-[#3f3f46] rounded-xl w-full max-w-md overflow-hidden flex flex-col'>
        <div className='flex items-center justify-between p-4 border-b border-[#3f3f46]'>
          <h3 className='text-lg font-semibold text-white'>Estado del Documento</h3>
          <button onClick={onClose} className='text-gray-400 hover:text-white'><span className='material-symbols-outlined'>close</span></button>
        </div>
        <div className='p-6'>
          <div className='mb-4'>
            <p className='text-sm text-gray-400'>Archivo</p>
            <p className='text-white font-medium truncate'>{recurso.nombre}</p>
          </div>
          <div className='mb-6'>
            <p className='text-sm text-gray-400 mb-2'>Estado de Firmas</p>
            {loading ? (
              <div className='text-gray-500 text-sm'>Cargando...</div>
            ) : isSealed ? (
              <div className='flex items-center gap-2 text-green-400 bg-green-500/10 p-3 rounded border border-green-500/20'>
                <span className='material-symbols-outlined'>verified</span>
                <span>Documento Completado y Sellado</span>
              </div>
            ) : (
              <ul className='space-y-3'>
                {firmas.map((f, i) => (
                  <li key={i} className='flex items-center justify-between bg-[#27272a] p-3 rounded border border-[#3f3f46]'>
                    <div>
                      <p className='text-sm text-white'>{f.usuarios?.nombre_completo || 'Usuario Desconocido'}</p>
                      <p className='text-xs text-gray-400'>{f.usuarios?.correo}</p>
                    </div>
                    <div>
                      {f.signature_image_url ? (
                        <span className='flex items-center gap-1 text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded'><span className='material-symbols-outlined text-[14px]'>check_circle</span> Firmado</span>
                      ) : (
                        <span className='flex items-center gap-1 text-xs text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded'><span className='material-symbols-outlined text-[14px]'>pending</span> Pendiente</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className='bg-blue-500/10 border border-blue-500/20 p-3 rounded'>
            <p className='text-xs text-blue-300 flex items-start gap-2'>
              <span className='material-symbols-outlined text-[16px]'>info</span>
              <span>Como remitente, tu acceso al contenido de este documento esta restringido por politicas de privacidad ("Solo Firmantes").</span>
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
