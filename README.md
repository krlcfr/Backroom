# BackRoom

Plataforma web colaborativa de estudio y organización del conocimiento. Crea espacios (BackRooms), organiza salas temáticas, comparte recursos académicos y controla permisos de acceso.

Proyecto de grado — Tecnología en Análisis y Desarrollo de Software (ADSO), SENA.

## Mockup (Stitch)

El diseño de referencia de la interfaz se mantiene en Stitch:

- **Mockup completo:** [https://stitch.withgoogle.com/projects/16836454301652292537](https://stitch.withgoogle.com/projects/16836454301652292537)

Es la fuente de verdad visual para las pantallas (login, registro, dashboard, salas, permisos, etc.). Las pantallas se van adaptando a código siguiendo el plan de mapeo mockup → UI → endpoint → página.

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router) — frontend y backend en un solo proyecto |
| UI | React 19, Tailwind CSS v4 |
| Lenguaje | TypeScript 5 |
| Base de datos | Supabase PostgreSQL (con Row Level Security) |
| Autenticación | Supabase Auth + `@supabase/ssr` (sesión vía cookies HTTP-only) |
| Validación | Zod |
| Correo transaccional | Resend (SMTP) |
| Despliegue previsto | Railway o Render |

La justificación de estas decisiones técnicas está en [`docs/JUSTIFICACION_TECNOLOGICA.md`](../docs/JUSTIFICACION_TECNOLOGICA.md).

## Requisitos

- Node.js 20+ (recomendado; probado también en v22)
- npm
- Cuenta en Supabase (plan gratuito)
- Cuenta en Resend (plan gratuito, para correos de recuperación de contraseña)

## Configuración inicial

1. Clonar el repositorio:
   ```bash
   git clone <repo-url>
   cd backroom
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Crear archivo `.env.local` a partir del ejemplo:
   ```bash
   cp .env.example .env.local
   ```

4. Completar las variables en `.env.local` con los valores reales de tu proyecto Supabase y Resend. Cada variable en `.env.example` incluye una descripción de dónde obtenerla.

5. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

6. Abrir [http://localhost:3000](http://localhost:3000).

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo (Turbopack) |
| `npm run build` | Build de producción |
| `npm start` | Iniciar servidor de producción (requiere `build` previo) |
| `npm run lint` | Ejecutar ESLint |
| `npm run seed:superadmin` | Crear el usuario SuperAdmin inicial (requiere `SUPERADMIN_EMAIL` y `SUPERADMIN_PASSWORD` en `.env.local`) |

## Estructura del proyecto

```
app/
├── api/                    # Route Handlers — la API (auth, backrooms, etc.)
├── (auth)/                 # Login, registro, recuperar contraseña
├── dashboard/               # Área autenticada: BackRooms, salas, recursos
├── admin/                   # Panel SuperAdmin
├── proxy.ts                 # Enrutamiento y redirecciones (no es el único límite de seguridad)
├── layout.tsx, page.tsx      # Layout raíz y landing page
lib/
├── auth/                    # Sesión (requireAuth, getSession) y permisos (RBAC)
├── services/                 # Lógica de negocio por dominio
├── supabase/                 # Clientes de Supabase (browser, server, admin)
├── validations/               # Esquemas de validación (Zod)
└── api-error.ts               # Manejo centralizado de errores HTTP
components/                  # Componentes de UI reutilizables
seeds/                       # Scripts de inicialización de datos (ej. SuperAdmin)
```

## Estado actual del proyecto

Este proyecto está en desarrollo activo. Estado honesto, sin maquillar, al momento de este README:

- ✅ Completo y probado: autenticación (registro, login, logout, recuperación de contraseña, perfil) y CRUD de BackRooms (crear, listar, ver detalle, eliminar).
- ⬜ Pendiente: Salas, Recursos, Invitaciones, Permisos y Planes (ver `docs/PLAN_DE_IMPLEMENTACION.md` para el detalle completo por tarea).
- ⬜ Pendiente: pruebas automatizadas, integración continua (CI/CD), contenerización, despliegue en servidor real, autenticación multifactor y límite de tasa de peticiones (rate limiting).

## Pruebas

Actualmente el proyecto no cuenta con pruebas automatizadas. Es una limitación conocida y registrada, en proceso de corrección — ver `docs/ESTADO_PROYECTO.md`.

## Uso de Inteligencia Artificial

Este proyecto fue desarrollado con asistencia de herramientas de inteligencia artificial (Claude, de Anthropic) para generación de código, revisión y documentación. El detalle de qué se generó, cómo se supervisó y qué comprende cada integrante del equipo está declarado en [`docs/DECLARACION_USO_IA.md`](../docs/DECLARACION_USO_IA.md).

## Despliegue

El proyecto está planeado para desplegarse en Railway o Render como Node.js standalone (no Vercel, debido a límites de tamaño de archivos en el plan gratuito frente al requerimiento de subida de recursos de hasta 50MB). Aún no desplegado — ver estado en `docs/ESTADO_PROYECTO.md`.

## Documentación

La documentación completa del proyecto (análisis, diseño, arquitectura, decisiones técnicas, plan de implementación) vive en un repositorio de documentación separado (`docs/`), gestionado aparte del código fuente.

## Autores

| Nombre | Rol |
|--------|-----|
| Santiago Pinzón Gallego | Backend |
| Cristian David | Frontend |

## Licencia

Uso educativo — Proyecto de grado, SENA (ADSO).
