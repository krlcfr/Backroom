-- Migration: add billing columns to organizations table
-- Date: 2026-08-20
-- Feature: Facturación y Planes (M-11)

-- Crear tipo enum para el plan y estado de suscripción
CREATE TYPE organization_plan AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('incomplete', 'incomplete_expired', 'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused');
CREATE TYPE billing_cycle AS ENUM ('monthly', 'annual');

ALTER TABLE organizations
  ADD COLUMN plan organization_plan NOT NULL DEFAULT 'free',
  ADD COLUMN stripe_customer_id varchar(255) UNIQUE,
  ADD COLUMN stripe_subscription_id varchar(255) UNIQUE,
  ADD COLUMN subscription_status subscription_status,
  ADD COLUMN billing_cycle billing_cycle,
  ADD COLUMN cancel_at_period_end boolean DEFAULT false,
  ADD COLUMN dedicated_schema varchar(255);

CREATE INDEX idx_organizations_stripe_customer_id ON organizations(stripe_customer_id);
CREATE INDEX idx_organizations_stripe_subscription_id ON organizations(stripe_subscription_id);

-- Actualizar permisos de RLS:
-- Los miembros pueden ver el plan (para UI/Límites), pero solo el owner puede actualizarlo.
-- Las actualizaciones de campos sensibles de stripe deben ser hechas por una clave de admin o webhook.
