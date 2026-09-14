# BackRoom

Plataforma web colaborativa de estudio y organización del conocimiento. Crea espacios (BackRooms), organiza salas temáticas, comparte recursos académicos y controla permisos de acceso.

**Mockup en Stitch:** [https://stitch.withgoogle.com/projects/7610019985253129332?pli=1](https://stitch.withgoogle.com/projects/7610019985253129332?pli=1)
**Repositorio de Documentación Institucional:** [https://github.com/cxcristian/BackRomm](https://github.com/cxcristian/BackRomm)

---

## 1. Identificación y Propósito del Proyecto

* **Nombre del Producto:** BackRoom.
* **Código del Proyecto:** PRJ-ADSO-BR-2026.
* **Problema Abordado:** Gestión descentralizada e insegura de recursos digitales en organizaciones y carencia de una estructura jerárquica con permisos granulares.
* **Objetivo General:** Plataforma web para la gestión de espacios privados orientada a organizaciones, con almacenamiento seguro, permisos granulares por sala y auditoría.
* **Equipo Responsable:** Santiago Pinzón (Líder y Responsable Técnico) y Cristian Giraldo (Responsable Funcional).
* **Licencia:** Privada / Uso Académico SENA (Proyecto de Grado - ADSO Ficha 3114227).

---

## 2. Stack Tecnológico y Arquitectura

Arquitectura Monolítica Modular sobre Next.js:

* **Frontend:** Next.js 16 (React 19) y Tailwind CSS v4.
* **Backend / API:** Next.js Route Handlers con endpoints asegurados mediante JWT y validación con Zod.
* **Base de Datos y Seguridad:** Supabase (PostgreSQL 15+) implementando Políticas de Seguridad a Nivel de Fila (RLS) para el aislamiento de datos y logs de auditoría (org_audit_logs).
* **Pagos / Facturación:** Stripe SDK para la gestión de suscripciones y webhooks.
* **Correo transaccional:** Resend (SMTP).

---

## 3. Estado del Alcance Entregado (MVP v9.0)

Este archivo declara explícitamente los componentes operativos y las limitaciones actuales del repositorio, de acuerdo al Principio de Transparencia y la versión actual real (v9.0).

**Módulos Completos:**
* Autenticación segura vía OAuth2 (Supabase Auth) y credenciales tradicionales.
* Configuración y autoservicio de perfiles organizacionales, junto con la gestión de cargos (M-17).
* Roles fijos (Propietario, Administrador, Miembro).
* Gestión de BackRooms y árbol recursivo de salas (limitado a 3 niveles en Demo) apoyado por un Mapa de Flujo de Salas Radial.
* Carga de recursos multiformato (docx, pptx, multimedia y links) con visores inmersivos.
* Control de accesos mediante matriz de permisos granulares (RBAC).
* Módulo de invitaciones y control de límites para cuentas Demo (100MB / 4 usuarios).
* Pasarela de pagos funcional integrada con Stripe (pp/api/stripe).
* Notificaciones in-app y alertas de sistema (M-16).

**Deuda Técnica e Implementaciones Parciales:**
* **Auditoría de Seguridad:** Las políticas SQL y RLS están configuradas en la base de datos, y los eventos se registran correctamente en org_audit_logs, pero el módulo no está construido completamente de forma visual en la interfaz de usuario con todos sus filtros avanzados.
* **Flujos de Trabajo (Workflows / Firmas):** Aunque la lógica backend (rutas /api/workflows y /api/documents/*/signatures) está implementada y es capaz de gestionar aprobaciones y firmas de documentos, el lienzo canvas en React para dibujar diagramas es funcional e interactivo pero está catalogado como inestable debido a problemas parciales de conexión con el motor de ejecución y de persistencia directa desde la interfaz a la base de datos.

---

## 4. Requisitos para Despliegue y Configuración Local

El siguiente manual de operación rápida guía al evaluador a reconstruir el entorno local:

1. **Requisitos Previos:** Node.js 20+, npm, cuentas en Supabase y Resend.
2. **Clonar e Instalar:**
   `ash
   git clone <repo-url>
   cd backroom
   npm install
   `
3. **Variables de Entorno Mínimas:** Proveer un archivo .env.local creado a partir de .env.example (libre de secretos reales), que detalle los campos requeridos para conectar las instancias locales de Supabase, Stripe y Resend.
4. **Comando de Arranque:** 
pm run dev para levantar el entorno de desarrollo local (servidor en http://localhost:3000).
5. **Ambiente de Demostración Inicial:** Al iniciar sesión por primera vez sin organización, el usuario accede a una Cuenta Demo local sin organización habilitada por defecto.
6. **Estrategia de Datos Semilla:** Uso del script seeds/superadmin.ts para levantar el primer administrador del sistema mediante 
pm run seed:superadmin.

---

## 5. Advertencias y Defectos Conocidos (Sección de Alerta)

> **Puntos Críticos de Atención Técnica:**
>
> * **[DEF-01]** El lienzo visual de flujos no almacena datos de forma robusta debido a la falta de conexión estable entre el botón de guardar del Frontend y el Backend.
> * **[DEF-02]** Existe un problema de experiencia de usuario (UX) que permite dibujar diagramas sin haber creado o guardado previamente un documento asociado.
> * **[DEF-03]** El sistema carece actualmente de transacciones con soporte "Rollback" en la base de datos ante fallos en la inserción de múltiples nodos de flujos de trabajo.
> * **[DEF-04]** Limitación conocida de pruebas automatizadas y CI/CD pendientes por configurar en el futuro despliegue sobre entornos standalone (Railway/Render).
