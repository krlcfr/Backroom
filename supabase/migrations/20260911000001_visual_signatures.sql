-- Migration: Add visual signature support
-- Date: 2026-09-11

-- Añadir columna visual_signature_url a usuarios
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS visual_signature_url TEXT;

-- Crear el bucket 'signatures' si no existe
INSERT INTO storage.buckets (id, name, public) 
VALUES ('signatures', 'signatures', false)
ON CONFLICT (id) DO NOTHING;

-- Policies for signatures bucket
-- INSERT: Usuarios pueden subir su propia firma
CREATE POLICY "Users can upload their own signature" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'signatures' 
  AND auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- SELECT: El usuario dueño puede ver su propia firma
CREATE POLICY "Users can view their own signature" 
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'signatures'
  AND auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- UPDATE: Usuarios pueden actualizar su propia firma
CREATE POLICY "Users can update their own signature" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'signatures'
  AND auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- DELETE: Usuarios pueden borrar su firma
CREATE POLICY "Users can delete their own signature" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'signatures'
  AND auth.uid()::text = (string_to_array(name, '/'))[1]
);
