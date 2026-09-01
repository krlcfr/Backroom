-- Migration: create workflow tables
-- Date: 2026-09-01
-- Feature: Flujograma de Trabajo (document_workflows, workflow_nodes, workflow_actions, document_annotations)

-- ============================================================
-- 1. ENUM TYPES
-- ============================================================

DO $$ BEGIN
  CREATE TYPE workflow_status AS ENUM ('draft', 'in_progress', 'under_review', 'completed', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE node_type AS ENUM ('linear', 'parallel', 'final');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE action_required AS ENUM ('sign', 'approve', 'review');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE node_status AS ENUM ('pending', 'approved', 'rejected', 'signed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE workflow_action_type AS ENUM ('approved', 'rejected', 'signed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE annotation_type AS ENUM ('rejection_note', 'general_comment', 'revision_feedback');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 2. TABLES
-- ============================================================

-- Flujos de trabajo vinculados a un documento (recurso)
CREATE TABLE IF NOT EXISTS public.document_workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES public.recursos(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  title text NOT NULL,
  status workflow_status NOT NULL DEFAULT 'draft',
  flow_graph_json jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dw_org ON public.document_workflows(organization_id);
CREATE INDEX IF NOT EXISTS idx_dw_doc ON public.document_workflows(document_id);

-- Nodos / pasos del flujo
CREATE TABLE IF NOT EXISTS public.workflow_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL REFERENCES public.document_workflows(id) ON DELETE CASCADE,
  cargo_id uuid REFERENCES public.cargos(id) ON DELETE SET NULL,
  assigned_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  step_order integer NOT NULL,
  node_type node_type NOT NULL DEFAULT 'linear',
  action_required action_required NOT NULL DEFAULT 'approve',
  status node_status NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wn_workflow ON public.workflow_nodes(workflow_id);
CREATE INDEX IF NOT EXISTS idx_wn_step ON public.workflow_nodes(workflow_id, step_order);

-- Acciones realizadas por usuarios sobre nodos
CREATE TABLE IF NOT EXISTS public.workflow_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL REFERENCES public.document_workflows(id) ON DELETE CASCADE,
  node_id uuid NOT NULL REFERENCES public.workflow_nodes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  action workflow_action_type NOT NULL,
  rejection_reason text,
  comments text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wa_workflow ON public.workflow_actions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_wa_node ON public.workflow_actions(node_id);

-- Anotaciones sobre documentos (vinculadas opcionalmente a un workflow/nodo)
CREATE TABLE IF NOT EXISTS public.document_annotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.recursos(id) ON DELETE CASCADE,
  workflow_id uuid REFERENCES public.document_workflows(id) ON DELETE CASCADE,
  node_id uuid REFERENCES public.workflow_nodes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  type annotation_type NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_da_doc ON public.document_annotations(document_id);

-- Vincular firmas existentes al workflow (columnas opcionales)
ALTER TABLE public.document_signatures
  ADD COLUMN IF NOT EXISTS workflow_id uuid REFERENCES public.document_workflows(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS node_id uuid REFERENCES public.workflow_nodes(id) ON DELETE CASCADE;

-- ============================================================
-- 3. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.document_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_annotations ENABLE ROW LEVEL SECURITY;

-- === document_workflows ===
CREATE POLICY dw_select ON public.document_workflows FOR SELECT
  USING (is_org_owner(organization_id) OR is_org_member(organization_id));

CREATE POLICY dw_insert ON public.document_workflows FOR INSERT
  WITH CHECK (is_org_owner(organization_id) OR is_org_member(organization_id));

CREATE POLICY dw_update ON public.document_workflows FOR UPDATE
  USING (
    created_by = auth.uid()
    OR is_org_owner(organization_id)
    OR is_org_admin(organization_id)
  );

CREATE POLICY dw_delete ON public.document_workflows FOR DELETE
  USING (
    created_by = auth.uid()
    OR is_org_owner(organization_id)
  );

-- === workflow_nodes ===
CREATE POLICY wn_select ON public.workflow_nodes FOR SELECT
  USING (
    workflow_id IN (SELECT id FROM public.document_workflows WHERE is_org_owner(organization_id) OR is_org_member(organization_id))
  );

CREATE POLICY wn_insert ON public.workflow_nodes FOR INSERT
  WITH CHECK (
    workflow_id IN (SELECT id FROM public.document_workflows WHERE is_org_owner(organization_id) OR is_org_member(organization_id))
  );

CREATE POLICY wn_update ON public.workflow_nodes FOR UPDATE
  USING (
    workflow_id IN (SELECT id FROM public.document_workflows WHERE is_org_owner(organization_id) OR is_org_member(organization_id))
  );

-- === workflow_actions ===
CREATE POLICY wa_select ON public.workflow_actions FOR SELECT
  USING (
    workflow_id IN (SELECT id FROM public.document_workflows WHERE is_org_owner(organization_id) OR is_org_member(organization_id))
  );

CREATE POLICY wa_insert ON public.workflow_actions FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- === document_annotations ===
CREATE POLICY da_select ON public.document_annotations FOR SELECT
  USING (
    workflow_id IN (SELECT id FROM public.document_workflows WHERE is_org_owner(organization_id) OR is_org_member(organization_id))
    OR user_id = auth.uid()
  );

CREATE POLICY da_insert ON public.document_annotations FOR INSERT
  WITH CHECK (user_id = auth.uid());
