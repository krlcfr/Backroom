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

La justificación de estas decisiones técnicas y su historial están en [`docs/ESTADO_PROYECTO.md`](https://github.com/cxcristian/BackRomm/blob/main/docs/ESTADO_PROYECTO.md) (secciones "Stack Tecnológico" y "Decisiones Técnicas") del [repositorio de documentación](#documentación).

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

- ✅ Completo y probado: Autenticación, Perfil, CRUD de BackRooms, Facturación/Stripe (Planes), Salas (CRUD, Jerarquía en árbol, Mapa Radial, Íconos custom) y Sistema de Permisos (RBAC global, Matriz granular, Flujograma de Auditoría).
- ⬜ Pendiente (En progreso): Recursos/Documentos (subir enlaces/archivos), Invitaciones formales a miembros.
- ⬜ Pendiente (Futuro): Pruebas automatizadas, CI/CD, despliegue, autenticación multifactor.

## Pruebas

Actualmente el proyecto no cuenta con pruebas automatizadas. Es una limitación conocida y registrada, en proceso de corrección — ver [`docs/ESTADO_PROYECTO.md`](https://github.com/cxcristian/BackRomm/blob/main/docs/ESTADO_PROYECTO.md).

## Despliegue

El proyecto está planeado para desplegarse en Railway o Render como Node.js standalone (no Vercel, debido a límites de tamaño de archivos en el plan gratuito frente al requerimiento de subida de recursos de hasta 50MB). Aún no desplegado — ver estado en [`docs/ESTADO_PROYECTO.md`](https://github.com/cxcristian/BackRomm/blob/main/docs/ESTADO_PROYECTO.md).

## Documentación

La documentación completa del proyecto (análisis, diseño, arquitectura, decisiones técnicas, plan de implementación) vive en un repositorio separado, gestionado aparte del código fuente:

- **Repositorio de documentación:** [https://github.com/cxcristian/BackRomm](https://github.com/cxcristian/BackRomm)

### Documentos de referencia

| Documento | Ubicación |
|-----------|-----------|
| Estado del proyecto (módulos IN/OUT, roles, decisiones técnicas) | [`docs/ESTADO_PROYECTO.md`](https://github.com/cxcristian/BackRomm/blob/main/docs/ESTADO_PROYECTO.md) |
| Acta de constitución | [`docs/analisis/acta.md`](https://github.com/cxcristian/BackRomm/blob/main/docs/analisis/acta.md) |
| Documento de alcance | [`docs/analisis/alcance.md`](https://github.com/cxcristian/BackRomm/blob/main/docs/analisis/alcance.md) |
| Requerimientos funcionales y no funcionales | [`docs/analisis/requerimientos.md`](https://github.com/cxcristian/BackRomm/blob/main/docs/analisis/requerimientos.md) |
| Historias de usuario | [`docs/analisis/historias.md`](https://github.com/cxcristian/BackRomm/blob/main/docs/analisis/historias.md) |
| Casos de uso | [`docs/analisis/casos_de_uso.md`](https://github.com/cxcristian/BackRomm/blob/main/docs/analisis/casos_de_uso.md) |
| Stakeholders y roles | [`docs/analisis/stakeholders.md`](https://github.com/cxcristian/BackRomm/blob/main/docs/analisis/stakeholders.md) |
| Arquitectura del software | [`docs/diseno/arquitectura.md`](https://github.com/cxcristian/BackRomm/blob/main/docs/diseno/arquitectura.md) |
| Modelo entidad-relación | [`docs/diseno/modelo_er.md`](https://github.com/cxcristian/BackRomm/blob/main/docs/diseno/modelo_er.md) |
| Diagramas UML | [`docs/diseno/diagramas_uml.md`](https://github.com/cxcristian/BackRomm/blob/main/docs/diseno/diagramas_uml.md) |
| Wireframes y mockups | [`docs/diseno/wireframes.md`](https://github.com/cxcristian/BackRomm/blob/main/docs/diseno/wireframes.md) |
| Sistema de diseño | [`docs/diseno/sistema_diseno.md`](https://github.com/cxcristian/BackRomm/blob/main/docs/diseno/sistema_diseno.md) |
| Catálogo de endpoints API | [`docs/diseno/endpoints_api.md`](https://github.com/cxcristian/BackRomm/blob/main/docs/diseno/endpoints_api.md) |
| Plan de implementación | [`docs/plan.md`](https://github.com/cxcristian/BackRomm/blob/main/docs/plan.md) |
| Asignación de tareas | [`docs/tareas.md`](https://github.com/cxcristian/BackRomm/blob/main/docs/tareas.md) |

## Autores

| Nombre | Rol |
|--------|-----|
| Santiago Pinzón Gallego | Backend |
| Cristian David | Frontend |

## Licencia

Uso educativo — Proyecto de grado, SENA (ADSO).
