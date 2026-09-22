# Changelog

Historial de cambios del proyecto BackRoom, siguiendo convenciones SemVer.

## [v9.3.0] - 2026-09-21
### Added
- **Workflows:** Botón "Anular y Editar" (reset-to-draft) para flujos en progreso.
- **UI Firmas:** Línea guía horizontal para firma manual de usuarios en \perfil-client.tsx\.
- **UI Firmas:** Redimensionamiento y línea fantasma de alineación en \DocumentSignatureCanvas.tsx\.

### Fixed
- **Workflows:** Resolución de error de base de datos de Postgres (conversión float a integer) al inyectar posiciones de arrastrar y soltar.
- **PKI:** Corrección matemática en \pdf-stamp.service.ts\ para conversión exacta y milimétrica de píxeles frontend a puntos PDF Bottom-Left.

## [v9.2.0] - 2026-09-21
### Added
- Integración completa con Next.js 16 App Router y Server Actions.
- Motor inmutable PKI usando \
ode-forge\ y \pdf-lib\ para estampar firmas y generar hashes SHA-256 (Acta 72).
- React Flow UI interactivas para el diseño de Workflows de aprobación.
- Pasarela de pagos con Stripe (Webhooks, Subscripciones y sincronización de cuotas).

### Changed
- Migración de infraestructura de despliegue desde contenedores a Serverless Vercel Edge.
- Actualización de manuales técnicos en la carpeta \/docs\ (ADRs y evidencias).

### Removed
- Infraestructura y contenedores de prueba obsoletos (Railway/Render).

## [v1.0.0] - 2026-05-27
### Added
- Línea base inicial del proyecto.
- Autenticación Supabase básica y roles RBAC estáticos.
