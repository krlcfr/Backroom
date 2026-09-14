-- Actualizar constraint de tipo de recurso para soportar archivos genéricos, imagenes, pdf, youtube y links

ALTER TABLE public.recursos DROP CONSTRAINT IF EXISTS recursos_tipo_check;

ALTER TABLE public.recursos ADD CONSTRAINT recursos_tipo_check 
CHECK (tipo::text = ANY (ARRAY['docx', 'pptx', 'mp3', 'mp4', 'enlace', 'youtube', 'video', 'image', 'pdf', 'archivo', 'link']::text[]));
