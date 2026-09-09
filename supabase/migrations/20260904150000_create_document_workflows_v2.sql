-- Migration: 012_create_document_workflows_v2 (v9.2)
-- Description: Sistema de Flujos Visuales, Posicionamiento de Firmas y Permisos Incrementales

-- 1. Tabla de lotes de documentos vinculados a un flujo
CREATE TABLE IF NOT EXISTS public.workflow_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'under_review', 'completed', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Modificación de la tabla de recursos para soportar multi-documento por flujo
ALTER TABLE public.recursos 
ADD COLUMN IF NOT EXISTS workflow_batch_id UUID REFERENCES public.workflow_batches(id) ON DELETE SET NULL;

-- 3. Modificación de la tabla de flujos de trabajo existente
ALTER TABLE public.document_workflows 
ADD COLUMN IF NOT EXISTS workflow_batch_id UUID REFERENCES public.workflow_batches(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS total_signers_count INT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS placed_signatures_count INT NOT NULL DEFAULT 0;

-- 4. Modificación de la tabla de nodos del flujo (Cargos + Usuarios + Acción)
-- Add 'in_turn' to node_status ENUM if it doesn't exist
DO $$
BEGIN
    ALTER TYPE node_status ADD VALUE 'in_turn';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 5. Tabla de posicionamiento de firmas en el documento (Coordenadas Canvas X, Y)
CREATE TABLE IF NOT EXISTS public.workflow_signature_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES public.document_workflows(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES public.recursos(id) ON DELETE CASCADE,
    workflow_node_id UUID NOT NULL REFERENCES public.workflow_nodes(id) ON DELETE CASCADE,
    assigned_user_id UUID NOT NULL REFERENCES auth.users(id),
    page_number INT NOT NULL DEFAULT 1,
    pos_x_percent NUMERIC(5,2) NOT NULL, -- Coordenada X porcentual (0-100%)
    pos_y_percent NUMERIC(5,2) NOT NULL, -- Coordenada Y porcentual (0-100%)
    width_px INT NOT NULL DEFAULT 150,
    height_px INT NOT NULL DEFAULT 60,
    is_signed BOOLEAN NOT NULL DEFAULT FALSE,
    signed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabla de permisos especiales de descarga incremental
CREATE TABLE IF NOT EXISTS public.workflow_download_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES public.document_workflows(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    can_download_partial BOOLEAN NOT NULL DEFAULT FALSE,
    can_download_full BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. RLS Policies
ALTER TABLE public.workflow_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_signature_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_download_permissions ENABLE ROW LEVEL SECURITY;

-- Politicas basicas para workflow_batches
CREATE POLICY wb_select ON public.workflow_batches FOR SELECT
  USING (is_org_owner(organization_id) OR is_org_member(organization_id));

CREATE POLICY wb_insert ON public.workflow_batches FOR INSERT
  WITH CHECK (is_org_owner(organization_id) OR is_org_member(organization_id));

CREATE POLICY wb_update ON public.workflow_batches FOR UPDATE
  USING (created_by = auth.uid() OR is_org_owner(organization_id) OR is_org_admin(organization_id));

CREATE POLICY wb_delete ON public.workflow_batches FOR DELETE
  USING (created_by = auth.uid() OR is_org_owner(organization_id));

-- For workflow_signature_positions
CREATE POLICY wsp_select ON public.workflow_signature_positions FOR SELECT
  USING (workflow_id IN (SELECT id FROM public.document_workflows WHERE is_org_owner(organization_id) OR is_org_member(organization_id)));

CREATE POLICY wsp_insert ON public.workflow_signature_positions FOR INSERT
  WITH CHECK (workflow_id IN (SELECT id FROM public.document_workflows WHERE is_org_owner(organization_id) OR is_org_member(organization_id)));

CREATE POLICY wsp_update ON public.workflow_signature_positions FOR UPDATE
  USING (assigned_user_id = auth.uid() OR workflow_id IN (SELECT id FROM public.document_workflows WHERE created_by = auth.uid() OR is_org_owner(organization_id)));

CREATE POLICY wsp_delete ON public.workflow_signature_positions FOR DELETE
  USING (workflow_id IN (SELECT id FROM public.document_workflows WHERE created_by = auth.uid() OR is_org_owner(organization_id)));

-- For workflow_download_permissions
CREATE POLICY wdp_select ON public.workflow_download_permissions FOR SELECT
  USING (user_id = auth.uid() OR workflow_id IN (SELECT id FROM public.document_workflows WHERE created_by = auth.uid() OR is_org_owner(organization_id)));

CREATE POLICY wdp_insert ON public.workflow_download_permissions FOR INSERT
  WITH CHECK (workflow_id IN (SELECT id FROM public.document_workflows WHERE created_by = auth.uid() OR is_org_owner(organization_id)));

CREATE POLICY wdp_update ON public.workflow_download_permissions FOR UPDATE
  USING (workflow_id IN (SELECT id FROM public.document_workflows WHERE created_by = auth.uid() OR is_org_owner(organization_id)));

CREATE POLICY wdp_delete ON public.workflow_download_permissions FOR DELETE
  USING (workflow_id IN (SELECT id FROM public.document_workflows WHERE created_by = auth.uid() OR is_org_owner(organization_id)));
