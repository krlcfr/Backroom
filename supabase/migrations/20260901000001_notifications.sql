-- Migration: create notifications table
-- Date: 2026-09-01
-- Feature: Notifications System

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  type varchar(50) NOT NULL, -- INVITATION, WORKFLOW_ACTION_REQUIRED, WORKFLOW_STATUS_UPDATE, SYSTEM_ALERT
  title varchar(255) NOT NULL,
  message text NOT NULL,
  action_url varchar(1000),
  action_data jsonb,
  read_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id) WHERE read_at IS NULL;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Los usuarios solo pueden ver y actualizar sus propias notificaciones
CREATE POLICY notifications_select ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY notifications_update ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Insertar desde el backend privilegiado (Service Role)
-- Si necesitamos insercin desde cliente en un futuro, se aadir otra poltica.

-- Habilitar replicacin en tiempo real para esta tabla
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
