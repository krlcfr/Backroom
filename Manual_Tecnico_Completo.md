**SERVICIO NACIONAL DE APRENDIZAJE – SENA**

**TECNOLOGÍA EN ANÁLISIS Y DESARROLLO DE SOFTWARE – ADSO**

**MANUAL TÉCNICO Y DE OPERACIÓN**

Plantilla institucional para instalación, configuración, despliegue,  
operación, mantenimiento, respaldo y recuperación

| Campo | Información |
| :---- | :---- |
| Nombre del proyecto | Backroom |
| Centro de formación | Centro de Tecnología de la Manufactura Avanzada – CTMA |
| Regional | Antioquia |
| Ficha | 3114227 |
| Equipo responsable | Santiago Pinzon - Cristian Giraldo |
| Instructor(es) | Juan Carlos |
| Versión del producto | 8.0 |
| Versión del documento | 1.0 |
| Fecha | 25/08/2026 |
| Clasificación | Documento técnico controlado |

| Finalidad del manual |
| :---- |
| Permitir que una persona técnica diferente al equipo autor pueda instalar, configurar, ejecutar, desplegar, mantener, diagnosticar y recuperar el sistema siguiendo instrucciones verificables y sin depender de conocimiento informal o configuraciones ocultas. |

# **Control documental**

| Versión | Fecha | Descripción del cambio | Elaboró | Revisó | Aprobó | Estado |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| 1.0 | 25/08/2026 | Versión inicial del manual | Cristian Giraldo | Santiago Pinzon | Santiago Pinzon | Borrador |
| 1.1 | 25/08/2026 | Inclusión de arquitectura Serverless, Supabase y CI/CD completo | Cristian Giraldo | Santiago Pinzon | Santiago Pinzon | Aprobado |

## **Aprobaciones**

| Rol | Nombre | Responsabilidad de validación | Fecha | Firma / aprobación |
| :---- | :---- | :---- | :---- | :---- |
| Responsable técnico | Cristian Giraldo | Exactitud de instalación, configuración y operación | 25/08/2026 | Cristian Giraldo |
| Líder del proyecto | Santiago Pinzon | Correspondencia con la versión entregada | 25/08/2026 | Santiago Pinzon |
| Instructor / evaluador | Juan Carlos | Verificabilidad y suficiencia técnica | 25/08/2026 | Juan Carlos |
| Administrador de infraestructura | Cristian Giraldo | Despliegue y operación, cuando aplique | 25/08/2026 | Cristian Giraldo |

## **Estado del documento**

| Estado | Descripción |
| :---- | :---- |
| Borrador | Documento en construcción; aún no debe usarse como referencia operativa definitiva. |
| En revisión | Contenido sometido a validación técnica y funcional. |
| Aprobado | Documento autorizado para la versión indicada del producto. |
| Obsoleto | Documento reemplazado por una versión posterior; se conserva solo como histórico. |

# **1. Propósito y alcance del manual**

Este manual documenta los procedimientos técnicos y operativos necesarios para reproducir, desplegar y mantener el sistema Backroom. Debe corresponder con el código fuente (Next.js 16, React 19, Tailwind v4), la arquitectura serverless, las variables de entorno, las migraciones de base de datos en Supabase, los scripts y la versión realmente entregada (v8.0).

| Regla de consistencia |
| :---- |
| Toda instrucción incluida debe poder ejecutarse. Los comandos, rutas, nombres de servicios, puertos, variables y dependencias deben coincidir con el repositorio y con el ambiente entregado. Una explicación elegante pero imposible de reproducir no cumple el propósito del manual. |

## **1.1 Objetivos específicos**

* Describir los requisitos de hardware, software, red y acceso a las plataformas Vercel, GitHub y Supabase.
* Explicar la estructura del repositorio App Router de Next.js y los componentes de UI.
* Documentar la configuración de variables de entorno (Supabase, Resend, Stripe) sin exponer credenciales.
* Establecer procedimientos reproducibles de instalación local vía npm y migraciones vía Supabase CLI.
* Definir el despliegue Serverless en Vercel y los ambientes de Producción/Preview.
* Documentar monitoreo y logs nativos (Vercel Edge, Supabase Log Explorer).
* Facilitar mantenimiento, incluyendo la aplicación de semillas de datos.
* Proporcionar catálogo de incidentes (Troubleshooting) de autenticación, pagos y RLS.

## **1.2 Audiencia**

| Perfil | Uso esperado del manual | Conocimiento mínimo |
| :---- | :---- | :---- |
| Desarrollador | Instalación local, pruebas, mantenimiento y evolución | React, Next.js, Git, TypeScript |
| Administrador de sistemas | Despliegue, configuración, monitoreo y recuperación | Serverless, APIs REST, PostgreSQL |
| DevOps / responsable de infraestructura | CI/CD, ambientes, secretos y observabilidad | GitHub Actions, Vercel, CI/CD |
| Instructor / evaluador | Comprobar reproducibilidad, operación y calidad | Fundamentos de desarrollo Web |
| Soporte técnico | Diagnóstico de incidentes y recuperación básica | Uso de Vercel Logs y Supabase |

## **1.3 Fuera de alcance**

| Actividades no cubiertas por este manual |
| :---- |
| 1. Capacitación de usuarios finales en el uso funcional de la plataforma de Gestión Documental Backroom.<br>2. Adquisición o administración de facturación de servicios de terceros (Planes Pro de Vercel, Supabase o Resend).<br>3. Desarrollo de requerimientos futuros que se encuentran en el Backlog (M-11, HU-FUT-02, HU-FUT-13).<br>4. Explicaciones detalladas de la sintaxis de React 19 o de TypeScript. |

# **2. Documentos y artefactos relacionados**

| Documento / artefacto | Código o ubicación | Versión | Relación con este manual |
| :---- | :---- | :---- | :---- |
| Arquitectura y Diseño Técnico | `BackroomDocumentation/docs/` | 8.0 | Define la separación entre UI y Backend (API Routes). |
| Plan de Calidad, Pruebas y Aceptación | `BackroomDocumentation/docs/` | 8.0 | Detalla cómo verificar los flujos críticos antes de un deploy. |
| Alcance y Especificación de Requisitos | `docs/analisis/requerimientos.md` | 8.0 | Define las características operativas y reglas de negocio. |
| README | `README.md` | 1.0 | Guía rápida de comandos de instalación para nuevos desarrolladores. |
| Contrato de API | `docs/diseno/endpoints_api.md` | 8.0 | Documenta las peticiones REST a las `/api/` internas. |
| Migraciones | `supabase/migrations/` | 1.0 | Almacena los scripts SQL para reproducir el esquema RLS. |
| Pipeline CI/CD | `.github/workflows/ci.yml` | 1.0 | Define las GitHub Actions para verificación automática. |
| CHANGELOG | `CHANGELOG.md` | 1.0 | Registra las notas de versiones (MVP 8.0). |
| Vistas y Features Pendientes | `FEATURES_Y_VISTAS_PENDIENTES.md` | 8.0 | Estado en vivo del desarrollo y ramas git activas. |

# **3. Identificación técnica del producto**

| Campo | Valor |
| :---- | :---- |
| Nombre técnico del sistema | Backroom App |
| Versión o etiqueta Git | v8.0 / Rama: dev |
| Repositorio principal | github.com/krlcfr/Backroom |
| Rama de entrega | main / dev |
| Tipo de solución | Web / API (Single Page Application con SSR y Serverless API) |
| Arquitectura general | Frontend Serverless (Next.js) acoplado a un BaaS (Supabase) |
| Licencia | Propietaria / Educativa (SENA) |
| Propietario técnico | Santiago Pinzon, Cristian Giraldo |
| Canal de soporte | Repositorio GitHub (Issues) |
| Ambiente de referencia | Producción (Vercel) y Base de Datos Supabase |

## **3.1 Resumen tecnológico**

| Capa / servicio | Tecnología | Versión | Función | Fuente de versión |
| :---- | :---- | :---- | :---- | :---- |
| Frontend | React + Tailwind CSS | 19.2.4 / 4.x | Construcción de interfaces interactivas y estilos. | package.json |
| Backend | Next.js (App Router) | 16.2.10 | Renderizado del lado del servidor (SSR) y Rutas de API. | package.json |
| Base de datos | Supabase (PostgreSQL) | 15+ | Almacenamiento relacional y Row Level Security (RLS). | Dashboard Supabase |
| Autenticación | Supabase Auth + SSR | ^0.x | Sesiones, JWT, Login con OAuth, Email y Password. | package.json |
| Motor de Servidor | Vercel Serverless / Node | Node 20 | Ejecución de funciones lógicas de backend. | .node-version |
| CI/CD | GitHub Actions + Vercel | N/A | Construcción automática y verificación del código. | .github/workflows |
| Monitoreo | Vercel Analytics + Log Drain| N/A | Trazabilidad de peticiones y rendimiento (Web Vitals). | Vercel Dashboard |
| Servicios externos | Resend, Stripe | 6.20 / 22.5 | Envío de correos de invitación y suscripciones SaaS. | package.json |

## **3.2 Componentes desplegables**

| ID | Componente | Artefacto generado | Puerto / endpoint | Dependencias | Responsable |
| :---- | :---- | :---- | :---- | :---- | :---- |
| CMP-01 | Frontend Next.js | Archivos Estáticos / Edge | 443 (HTTPS) - Web | API Internas, Supabase | Cristian Giraldo |
| CMP-02 | Backend (API Routes) | Lambdas Serverless | `/api/*` | Supabase, Resend, Stripe| Santiago Pinzon |
| CMP-03 | Base de Datos (DB) | Instancia Postgres | 5432 (TLS) | N/A | Administrador |
| CMP-04 | Bucket Storage | Contenedor de Archivos | Supabase Storage URL | BD para RLS | Administrador |

# **4. Requisitos de infraestructura**

## **4.1 Requisitos mínimos y recomendados**

| Recurso | Mínimo (Local) | Recomendado (Prod) | Observaciones |
| :---- | :---- | :---- | :---- |
| CPU | 2 Cores | Auto-escalable | Vercel maneja la asignación Serverless. |
| Memoria RAM | 4 GB | 1 GB por Función | El servidor local requiere más RAM por Webpack/Turbopack. |
| Almacenamiento | 2 GB libre | 500 MB (BD Supabase) | El Storage de archivos escala en AWS S3 vía Supabase. |
| Sistema operativo | Windows 10 / Ubuntu 20 | Amazon Linux / Vercel | La app es multiplataforma gracias a Node.js. |
| Conectividad | 10 Mbps | Alta disponibilidad | Vital para instalar dependencias de NPM (300+ MB). |
| Navegador / cliente | Chrome 90+, Edge 90+ | Chrome 110+, Safari | La plataforma requiere navegadores con soporte de CSS moderno. |
| Resolución / dispositivo | 1024x768 | 1920x1080 | Interfaz totalmente responsiva con Tailwind CSS. |

## **4.2 Dependencias de software**

| Dependencia | Versión exacta o rango | Obligatoria | Instalación / fuente | Verificación |
| :---- | :---- | :---- | :---- | :---- |
| Git | >= 2.30 | Sí | git-scm.com | `git --version` |
| Node.js (Runtime) | >= 20.0.0 | Sí | nodejs.org | `node -v` |
| npm (Package Mgr) | >= 10.0.0 | Sí | Viene con Node.js | `npm -v` |
| Supabase CLI | >= 1.200 | No (Desarrollo)| npm i -g supabase | `supabase -v` |
| Docker Desktop | >= 4.0 | No (Desarrollo)| docker.com | `docker --version` |
| TypeScript | ^5.x | Sí (Dev) | npm | `npx tsc -v` |

## **4.3 Puertos, protocolos y conectividad**

| Servicio | Puerto | Protocolo | Origen permitido | Destino | Justificación |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Frontend Dev | 3000 | HTTP | localhost | Máquina local | Previsualización en desarrollo |
| Supabase Studio | 54323 | HTTP | localhost | Docker Container | Interfaz de la BD local para dev |
| Aplicación Web | 443 | HTTPS | Público | Vercel Edge | Acceso principal a Backroom |
| Base de Datos | 5432 | TCP (SSL) | Vercel IPs | Supabase Cloud | Conexión segura ORM/Backend |
| SMTP (Resend) | 465 | TCP (SSL) | Vercel Edge | Resend API | Envío de correos salientes |

## **4.4 Cuentas y accesos requeridos**

| Recurso | Tipo de acceso | Rol mínimo | Responsable de otorgar | Procedimiento |
| :---- | :---- | :---- | :---- | :---- |
| Repositorio (GitHub) | Escritura / Merge | Contributor | Santiago Pinzon | Envío de invitación en GitHub Repo |
| Servidor (Vercel) | Despliegue / Logs | Member | Cristian Giraldo | Invitación por email al Vercel Team |
| Base de datos (Supa) | Estructura / Datos | Developer | Cristian Giraldo | Invitación Supabase Dashboard |
| DNS / dominio | Gestión de DNS | Admin | Institución / Líder | Configuración de CNAME en proveedor |
| Servicio Resend | API Keys | Developer | Santiago Pinzon | Generar API Key desde el Dashboard |

# **5. Estructura del repositorio**

| Criterio de mantenibilidad |
| :---- |
| La estructura sigue el enrutamiento 'App Router' de Next.js, combinando rutas de páginas y rutas API en un solo árbol. Los componentes compartidos están centralizados. Las migraciones de base de datos son independientes. |

## **5.1 Árbol principal**

```text
Backroom/
├── .github/workflows/    # Pipelines de CI (Acciones de integración)
├── app/                  # Sistema de enrutamiento Next.js (Rutas web y APIs)
│   ├── (auth)/           # Rutas relacionadas a login, registro y recuperación
│   ├── api/              # Endpoints Backend (/api/auth, /api/organizations...)
│   └── dashboard/        # Rutas protegidas de la aplicación
├── components/           # Componentes UI (Botones, Modales, Sidebar, Layout)
├── lib/                  # Lógica de negocio, wrappers de Supabase y validaciones
├── public/               # Imágenes estáticas y logos de la plataforma
├── supabase/
│   ├── migrations/       # Scripts SQL para generación de tablas y políticas
│   └── config.toml       # Configuración del entorno de base de datos local
├── types/                # Definiciones de TypeScript y esquema generado de BD
├── .env.example          # Plantilla de variables de entorno (sin secretos)
├── package.json          # Listado de dependencias y scripts de automatización
└── README.md             # Documentación principal de inicio
```

## **5.2 Descripción de directorios**

| Ruta | Contenido | Responsabilidad | Artefactos principales |
| :---- | :---- | :---- | :---- |
| `/app` | Páginas y Layouts | Presentar la interfaz UI y gestionar URLs | `page.tsx`, `layout.tsx`, `error.tsx` |
| `/app/api` | Endpoints Backend | Proveer datos JSON a las vistas | `route.ts` (GET, POST, PATCH) |
| `/components` | UI React Components | Mantener el código modular y reutilizable | `dashboard-sidebar.tsx`, `modal.tsx` |
| `/supabase/migrations` | SQL Scripts | Evolución de BD y Seguridad (RLS) | `20240825_init_schema.sql` |
| `/lib` | Controladores / Utils | Conexión con Supabase y lógica externa | `supabase/client.ts`, `auth/rate-limit.ts` |
| `/types` | Tipos TypeScript | Asegurar tipado fuerte en desarrollo | `database.types.ts` |

## **5.3 Archivos fundamentales**

| Archivo | Propósito | Debe contener | No debe contener |
| :---- | :---- | :---- | :---- |
| README.md | Inicio rápido | Descripción, instalación, comandos y enlaces | Información desactualizada o logs |
| .env.example | Variables requeridas | Nombres y valores ficticios o llaves públicas | Secretos o credenciales JWT/DB reales |
| CHANGELOG.md | Historial de versiones | Cambios, correcciones y nuevas features | Commits sin limpieza semántica |
| package.json | Control de paquetes | Dependencias estrictas del stack Node.js | Librerías no utilizadas (Deuda técnica) |
| middleware.ts | Edge Middleware | Lógica de interceptación y redirección (Auth) | Consultas SQL pesadas al servidor |

# **6. Configuración y gestión de variables**

## **6.1 Matriz de variables de entorno**

| Variable | Descripción | Tipo | Obligatoria | Valor de ejemplo | Secreto | Ambientes |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| `NEXT_PUBLIC_APP_URL` | URL de la plataforma | URL | Sí | `http://localhost:3000` | No | Todos |
| `NEXT_PUBLIC_SUPABASE_URL` | API Endpoint Supabase | URL | Sí | `https://x.supabase.co` | No | Todos |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`| Llave pública Supabase | JWT | Sí | `eyJhbGci...` | No | Todos |
| `SUPABASE_SERVICE_ROLE_KEY` | Llave maestra BD | JWT | Sí | `eyJhbGci...` | Sí | Solo Servidor (Prod/Dev) |
| `RESEND_API_KEY` | Llave API correos | String | No | `re_123456789...` | Sí | Servidor |
| `STRIPE_SECRET_KEY` | Pasarela de pagos | String | No | `sk_test_51Nx...` | Sí | Servidor |
| `NODE_ENV` | Entorno de ejecución | String | Automática | `development` | No | Todos |

| Seguridad obligatoria |
| :---- |
| El manual debe explicar dónde se obtienen y cómo se configuran los secretos, pero nunca debe incluir valores reales. Los secretos en React NUNCA deben usar el prefijo `NEXT_PUBLIC_` si dan privilegios elevados (como `SERVICE_ROLE_KEY`). El archivo `.env.local` debe estar en el `.gitignore`. |

## **6.2 Configuración por ambiente**

| Aspecto | Desarrollo | Pruebas (Preview) | Producción |
| :---- | :---- | :---- | :---- |
| Base de datos | Supabase Local (Docker) / Proyecto Dev | Supabase (Proyecto Staging) | Supabase (Proyecto Prod dedicado) |
| Nivel de logs | Verbose (Consola local) | Warnings / Errors | Errors (Vercel Logs) |
| Dominio / URL | `http://localhost:3000` | `https://*-preview.vercel.app` | `https://backroom.app` |
| Servicios externos | Resend Test / Stripe Test | Resend Test / Stripe Test | Resend Live / Stripe Live |
| Datos permitidos | Ficticios o sembrados (`seed.sql`) | Ficticios o copias anonimizadas | Reales controlados (Usuarios reales) |
| Depuración | Permitida de forma controlada | Limitada | Deshabilitada (Mapas de código ofuscados)|
| Secretos | Archivo `.env.local` | Vercel Environment Variables | Vercel Environment Variables |

## **6.3 Verificación de configuración**

1. Confirmar que `.env.example` contiene todas las variables requeridas (ver listado anterior).
2. Duplicar el archivo y renombrarlo como `.env.local`.
3. Validar que los valores de `NEXT_PUBLIC_SUPABASE_URL` y `ANON_KEY` coincidan con el dashboard de Supabase (Settings -> API).
4. Ejecutar el script interno (si existe) para validar que no falten variables críticas.

```bash
# Verificación básica en terminal de conexión a Supabase
curl -I -X GET "TU_SUPABASE_URL" \
-H "apikey: TU_SUPABASE_ANON_KEY" \
-H "Authorization: Bearer TU_SUPABASE_ANON_KEY"
# Esperado: 200 OK
```

# **7. Instalación y ejecución en ambiente local**

## **7.1 Preparación**

6. Instalar Node.js v20+ y Git desde sus portales oficiales.
7. Clonar el repositorio desde GitHub (`https://github.com/krlcfr/Backroom`).
8. Cambiar a la rama de desarrollo aprobada (`dev`).
9. Crear la configuración local `.env.local` a partir del `.env.example`.
10. Instalar las dependencias utilizando el gestor de paquetes NPM (`npm install`).
11. Vincular el proyecto con Supabase (`npx supabase login` y `npx supabase link`).
12. Aplicar migraciones al servidor local de base de datos (`npx supabase db push`).
13. Ejecutar comando de linter (`npm run lint`) para verificación mínima.
14. Iniciar el servidor local (`npm run dev`).
15. Confirmar salud accediendo a `http://localhost:3000`.

## **7.2 Comandos de instalación**

| Paso | Comando | Resultado esperado | Evidencia / verificación |
| :---- | :---- | :---- | :---- |
| Clonar repositorio | `git clone [url_repo]` | Código descargado en carpeta Backroom | Carpeta creada y archivos visibles |
| Seleccionar versión | `git checkout dev` | Cambio a rama `dev` (o la deseada) | `git branch` muestra `dev` con asterisco |
| Instalar dependencias | `npm install` | Instalación completa sin fallos graves | Carpeta `node_modules/` generada |
| Crear configuración | `cp .env.example .env.local` | Archivo copiado listo para edición | Archivo `.env.local` existe |
| Preparar base de datos | `npx supabase db push` | Migraciones aplicadas al backend DB | Mensaje "Success" de Supabase CLI |
| Ejecutar linting | `npm run lint` | Código verificado estáticamente | Mensaje de éxito o warnings menores |
| Iniciar aplicación | `npm run dev` | Servidor levantado en puerto 3000 | Log en consola `ready - started server` |

## **7.3 Verificación inicial**

| Verificación | Método | Resultado esperado | Cumple |
| :---- | :---- | :---- | :---- |
| Compilación / build | Ejecutar `npm run build` | Finaliza sin errores, crea carpeta `.next/` | Sí |
| Conexión a base de datos | Cargar la web o `npx supabase status` | Conexión exitosa, carga de tablas | Sí |
| Health check | Visitar URL inicial | Carga landing page y hero sin errores | Sí |
| Inicio de sesión de prueba | Entrar a `/login` e ingresar credenciales | Redirige al `/dashboard` o Panel Demo | Sí |
| Flujo crítico | Crear un Backroom y Sala en UI | Creado y visible en la barra lateral | Sí |
| Logs | Terminal donde corre `npm run dev` | Sin errores `500` ni advertencias React | Sí |

# **8. Base de datos, migraciones y datos semilla**

## **8.1 Creación y configuración**

La base de datos es PostgreSQL provista como servicio por Supabase (BaaS). El aprovisionamiento de permisos, extensiones (como `pgcrypto` o `pgjwt`), la zona horaria en UTC y el encoding en UTF-8, lo maneja la plataforma de forma gestionada. El acceso directo al motor se delega a usuarios internos, mientras la app React utiliza el API REST autogenerado protegido con RLS (Row Level Security).

## **8.2 Migraciones**

Las migraciones son rastreadas usando `Supabase CLI` para mantener la base de datos de producción sincronizada con el código fuente local de manera controlada.

| Operación | Comando / procedimiento | Precondición | Resultado esperado | Rollback |
| :---- | :---- | :---- | :---- | :---- |
| Consultar estado | `npx supabase db remote commit` | CLI instalado y linkeado | Diferencias entre local y remoto | N/A |
| Aplicar migraciones | `npx supabase db push` | Local validado, variables correctas | Cambios aplicados a la DB remota | Restauración DB (Point in time) |
| Crear nueva migración | `npx supabase migration new name` | CLI local funcionando | Archivo `.sql` creado en `/migrations` | Borrar el archivo `.sql` manual |
| Revertir migración | `npx supabase db reset` (Solo Local)| Usar en desarrollo | DB local destruida y reconstruida | Automático |
| Validar esquema (Tipos)| `npx supabase gen types typescript` | DB corriendo | Archivo `types/database.types.ts` actualizado | `git checkout -- types/` |

## **8.3 Datos semilla**

| Conjunto | Finalidad | Ambiente permitido | Comando | Contiene datos personales |
| :---- | :---- | :---- | :---- | :---- |
| Datos mínimos (SuperAdmin) | Generar un SuperAdmin base con plan Enterprise | Desarrollo / Local / Prod | `npm run seed:superadmin` | No (credenciales genéricas y encriptadas) |
| Datos de demostración | Rellenar tablas locales (Organizaciones, salas, usuarios dummy) | Local / Pruebas | `npx supabase db reset` (Llama a `seed.sql`) | No |
| Datos de prueba | Generar información estática para End-to-End | Pruebas | Scripts en `tests/seed/` (Futuro) | No |

## **8.4 Integridad y mantenimiento**

* Todas las tablas críticas (`rooms`, `backrooms`, `resources`) deben contar con políticas de `Row Level Security (RLS)` para restringir SELECT, INSERT, UPDATE, DELETE basados en `auth.uid()`.
* Uso intensivo de Foreign Keys (FK) con la cláusula `ON DELETE CASCADE`. Eliminar una organización borrará todos sus BackRooms, Salas, Recursos y Miembros asociadas sin dejar registros huérfanos.
* Cualquier modificación a la estructura debe registrarse generando una nueva migración SQL reproducible.

# **9. Compilación, pruebas y verificación técnica**

## **9.1 Comandos principales**

| Actividad | Comando | Ambiente | Criterio de éxito |
| :---- | :---- | :---- | :---- |
| Lint | `npm run lint` | Local / CI | Sin errores críticos de estilo y validación React. |
| Formato (Typescript) | `npx tsc --noEmit` | Local / CI | Salida limpia, ningún error de tipado estricto TS. |
| Pruebas unitarias | `npm run test` (Pendiente config Vitest/Jest) | Local / CI | Todas las pruebas en `tests/` pasan (Ver Deuda DT-01). |
| Pruebas de integración | Ejecución manual de UI | Pruebas | Los flujos completos de login, CRUD salas son exitosos. |
| Pruebas E2E | Playwright/Cypress (Pendiente) | Pruebas | Flujos críticos aprobados por simulador. |
| Cobertura | `npm run test:coverage` (Pendiente) | CI | Porcentaje de código evaluado superior al límite 70%. |
| Build | `npm run build` | Local / CI | App empaquetada (estáticos y serverless) generada con éxito. |
| Auditoría de dependencias | `npm audit` | CI | 0 vulnerabilidades "Críticas" en librerías instaladas. |

## **9.2 Criterios antes de desplegar**

| Control | Obligatorio | Evidencia | Responsable | Estado |
| :---- | :---- | :---- | :---- | :---- |
| Build reproducible | Sí | Output en verde de `npm run build` | Desarrollador | Activo |
| Pruebas críticas aprobadas | Sí | Confirmación visual (Humo) y Linter OK | Calidad / Lider | Activo |
| Migraciones verificadas | Sí | Verificación cruzada entre DB en vivo y schemas | Admin Base Datos | Activo |
| Secretos fuera del repositorio | Sí | Archivo `.env` descartado por gitignore | Todos | Activo |
| Auditoría de dependencias | Sí | Revisión periódica en GitHub Security Alerts | DevOps | Activo |
| Documentación actualizada | Sí | MD de "Features y Vistas" refleja la realidad | Desarrollador | Activo |
| Plan de rollback probado | Condicionado | Conocimiento de la reversión nativa en Vercel | Administrador | Activo |

# **10. Construcción y artefactos de entrega**

| Artefacto | Ruta de generación | Comando | Contenido | Destino |
| :---- | :---- | :---- | :---- | :---- |
| Frontend compilado estático | `.next/static` | `npm run build` | Bundles JS, CSS minificados, Imágenes optimizadas | CDN Global de Vercel |
| Backend Serverless (API) | `.next/server/app/api` | `npm run build` | Código ejecutable Node para Serverless Functions | Vercel Edge / Node |
| Imagen de contenedor | N/A | N/A | (Proyecto Serverless, Vercel omite el uso de Docker) | Vercel Cloud |
| Migraciones BD SQL | `supabase/migrations/` | `supabase migration new` | Instrucciones DDL para alterar el esquema PostgreSQL | Base de datos Cloud |
| Documentación API | `docs/endpoints_api.md`| N/A | Listado Markdown con definiciones de peticiones | GitHub Repo |
| Reporte de Calidad de código | `REPORTE_CALIDAD.md` | Manual | Estado de la deuda técnica | GitHub Repo |

## **10.1 Versionamiento**

| Elemento | Convención | Ejemplo | Responsable |
| :---- | :---- | :---- | :---- |
| Versión de producto | Semantic Versioning (SemVer) | `v8.0.1` | Líder del proyecto |
| Etiqueta Git | `v<mayor>.<menor>` | `v8.0` | Equipo DevOps / Líder |
| Imagen de contenedor | N/A | N/A | N/A |
| Migración DB | `timestamp_descripción.sql` | `20260825123000_crear_auditoria.sql` | Desarrollador asignado |
| Documento | Versiones de Enteros.Decimal | `1.0` | Autor del documento |

## **10.2 Integridad de artefactos**

* El archivo `package-lock.json` se compromete obligatoriamente en el repositorio para garantizar dependencias idénticas.
* Los builds se lanzan desde commits firmes en las ramas principales, desencadenados por webhook de GitHub a Vercel.
* Jamás se altera manualmente la compilación (archivos en `.next/`) en producción; todo cambio debe pasar por Git.

# **11. Despliegue por ambiente**

## **11.1 Inventario de ambientes**

| Ambiente | Propósito | URL / host | Responsable | Datos | Acceso |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Desarrollo | Creación de Features Local | `localhost:3000` | Desarrollador | Ficticios (Seed local) | Red Local |
| Pruebas (Preview) | Aprobación de Pull Requests | `*.vercel.app` (Preview Links) | QA / Líder | Ficticios / Anonimizados | Solo equipo interno |
| Aceptación (Staging)| Homologar antes de salida | `staging.backroom.app` | Líder / Stakeholder| Copia de Producción parcial| Restringido con clave |
| Producción | App viva orientada al cliente | `backroom.app` (o su dominio real)| Administrador | Reales y protegidos (RLS) | Público (Auth requerido) |

## **11.2 Procedimiento de despliegue**

16. Confirmar aprobación de la versión, confirmando que la rama `dev` funciona al 100%.
17. Verificar de forma local si existen migraciones SQL pendientes. Ejecutar respaldo manual de BD en Supabase (si aplica).
18. Validar variables secretas actualizadas en el Dashboard de Vercel y Supabase.
19. Hacer un Pull Request y fusionar el código a la rama principal (Push a `main`).
20. Aplicar migraciones controladamente al servidor de Base de Datos remota (`npx supabase db push`).
21. Vercel intercepta el evento GitHub de forma automática y lanza un despliegue (Build > Deploy).
22. Ejecutar verificaciones de salud, ingresando a la URL final.
23. Confirmar que los logs de Edge Network de Vercel no reporten excepciones `500`.
24. Registrar la versión desplegada en CHANGELOG y cerrar la iteración.
25. Notificar el resultado (vía Slack/Teams) al equipo de desarrollo y stakeholders.

## **11.3 Registro de despliegue**

| Fecha / hora | Ambiente | Versión | Responsable | Migraciones | Resultado | Evidencia |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| 25/08/2026 | Producción | v8.0 MVP | Cristian Giraldo | Sí (Nuevas Tablas orgs) | Exitoso | Dashboard de Vercel Deploy |
| 20/08/2026 | Preview | PR #42 | Santiago Pinzon | No | Exitoso | Link Vercel Preview |
| 15/08/2026 | Producción | v7.5 Auth Fix| Cristian Giraldo | No | Exitoso | Dashboard de Vercel Deploy |

## **11.4 Pruebas de humo posteriores**

| ID | Verificación | Resultado esperado | Resultado real | Estado |
| :---- | :---- | :---- | :---- | :---- |
| SMK-01 | Health check Web | Renderizado inicial de Next.js en menos de 2s | Renderizado en 1.2s | Aprobado |
| SMK-02 | Acceso principal API | API `/api/health` retorna `{ status: 'ok' }` | Retorna 200 OK | Aprobado |
| SMK-03 | Autenticación Auth | Posibilidad de Loguearse y redirección correcta | Sesión guardada en Cookie | Aprobado |
| SMK-04 | Operación crítica | Creación de una Sala en un Backroom existente | Nueva sala creada en UI | Aprobado |
| SMK-05 | Persistencia DB | La Sala sigue ahí al refrescar la página web | Sala se obtiene del API | Aprobado |
| SMK-06 | Logs Vercel | El dashboard de Vercel Edge Logs no muestra Errors | Todo en verde (Info) | Aprobado |

# **12. Reversión y recuperación ante despliegue fallido**

| Condición crítica |
| :---- |
| No debe ejecutarse un despliegue con cambios incompatibles de datos (ejemplo, borrar tablas usadas) sin definir previamente cómo se recuperará el servicio. El rollback de código en Vercel NO retrocederá los datos de la base de datos Supabase, provocando errores en cascada. |

## **12.1 Criterios para activar rollback**

* El sistema retorna error genérico `500 Internal Server Error` a más del 10% de peticiones (ver Vercel Analytics).
* Un flujo crítico queda bloqueado en producción de manera irreversible por código (ej: Nadie puede iniciar sesión).
* Se detecta que políticas de RLS en base de datos están permitiendo fuga de datos de otras organizaciones.
* Aparece una vulnerabilidad crítica documentada recién expuesta y en uso.
* El responsable de liberación declara un "No-Go" después de realizar el QA del ambiente en vivo.

## **12.2 Procedimiento de rollback**

| Paso | Acción | Responsable | Comando / procedimiento | Verificación |
| :---- | :---- | :---- | :---- | :---- |
| 1 | Detener o aislar la versión defectuosa | DevOps | En Vercel Dashboard, entrar al "Deployment" defectuoso. | URL anterior lista para promover. |
| 2 | Restaurar versión anterior | DevOps | Clic en "Promote to Production" sobre un Build anterior sano. | Sitio web revierte al código sano instantáneo (Instant Rollback). |
| 3 | Revertir configuración / Variables | Líder Backend | Revertir las variables .env en Vercel/Supabase si causaron el fallo. | Re-deploy manual si se cambió env. |
| 4 | Tratar migraciones o restaurar datos | Admin Base Datos | Utilizar PITR de Supabase o ejecutar scripts SQL correctivos. | Data íntegra nuevamente. |
| 5 | Ejecutar pruebas de humo | QA / Devs | Repetir el checklist SMK-01 a SMK-06 en producción. | Humo superado, sin errores. |
| 6 | Registrar incidente y notificar | Líder Proyecto | Documentar el suceso en el post-mortem (Issue Tracker). | Incidente etiquetado y analizado. |

## **12.3 Registro de reversión**

| Fecha | Versión retirada | Versión restaurada | Motivo | Impacto | Responsable | Resultado |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| 10/08/2026 | v7.8 Fallo Migración | v7.7 Estable | Renombramiento de columna `sala_id` causó 500 en frontend | Inaccesibilidad de salas (5 min) | Santiago P. | Rollback exitoso |
| 02/08/2026 | v7.5 Rate Limit Falla | v7.4 Estable | Middleware de Auth entró en bucle infinito | Inaccesibilidad general (2 min) | Cristian G. | Rollback exitoso |

# **13. Operación rutinaria**

## **13.1 Arranque y detención**

| Operación | Comando / procedimiento | Orden | Verificación | Riesgo |
| :---- | :---- | :---- | :---- | :---- |
| Iniciar base local (Dev) | `npx supabase start` en consola | 1 | Interfaz "Studio" en puerto 54323 disponible. | Bajo |
| Iniciar backend y web | `npm run dev` en directorio app | 2 | Puerto 3000 abierto, log "ready". | Bajo |
| Iniciar frontend local | Integrado en comando anterior. | 3 | Web carga. | Bajo |
| Detener servicios local | `CTRL+C` para Next, `npx supabase stop` | N/A | Contenedores docker se detienen. | Bajo |
| Reiniciar servicio Prod | Despliegue nuevo (Vercel) / Auto | N/A | Edge cache purgada, workers refrescados. | Bajo-Medio |

*Nota Producción:* Debido a la arquitectura 100% Serverless, no se requiere comandos manuales para apagar o encender el servidor en la nube. Vercel despierta los recursos bajo demanda, y Supabase Postgres opera ininterrumpidamente 24/7.

## **13.2 Tareas periódicas**

| Tarea | Frecuencia | Responsable | Procedimiento | Evidencia |
| :---- | :---- | :---- | :---- | :---- |
| Revisión de logs en BD | Diaria (según uso) | Admin Base Datos | Acceder a Log Explorer en Dashboard de Supabase. | Verificación de Queries lentas. |
| Verificación de respaldos | Semanal | DevOps | Revisar Database -> Backups en Supabase y ver estados. | Fecha del último backup reciente. |
| Revisión de capacidad | Mensual | Líder | Ver gráficos de Compute y Storage Egress en Supabase. | Cuota bajo el 80% límite plan. |
| Auditoría de dependencias | Semanal | Desarrollador | Correr `npm audit` y actualizar librerías críticas. | Mensaje "0 vulnerabilities". |
| Renovación certificados | Anual (Automático) | Vercel | Vercel renueva SSL por sí solo; verificar si marca error. | Candado HTTPs verde. |
| Revisión usuarios admin | Trimestral | Líder Proyecto | Validar cuentas en GitHub, Vercel, Supabase y Stripe. | Usuarios no activos eliminados. |
| Mantenimiento base datos | Trimestral | Admin Base Datos | Analizar uso de índices y Vacuum a Postgres (Automático).| Dashboards de rendimiento OK. |

## **13.3 Ventanas de mantenimiento**

| Actividad | Ventana | Duración estimada | Impacto | Notificación | Aprobación |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Upgrade Postgres Supabase | Domingo 03:00 AM | 5 - 15 minutos | Offline BD Temporal, Error 500 web | Banner app 48h antes | Líder y Equipo |
| Refactor crítico en Tablas | Domingo 04:00 AM | 30 minutos | Aplicación modo mantenimiento | Email masivo | Líder y Equipo |

# **14. Logs, monitoreo y observabilidad**

## **14.1 Registro de eventos**

| Fuente | Ubicación | Formato | Nivel | Retención | Datos prohibidos |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Aplicación Next (API) | Vercel Logs Runtime | Texto, Next.js JSON | info, warn, error | Plan Free (1D), Pro (30D) | Contraseñas, JWT tokens crudos |
| Servidor web (Proxy/Edge)| Vercel Edge Logs | Apache/Nginx format | info, error | Plan Vercel Limits | Direcciones físicas, PII alta |
| Base de datos y Auth | Supabase Log Explorer | Estructurado JSON | warn, error, info | Plan Supabase (7D - 90D)| Datos sensibles sin ofuscar en querys |
| Pipeline Github Actions | GitHub Actions Tab | Texto plano (Consola) | info, error | 90 días | Secret keys de Vercel/Supa |
| Auditoría App (M-10) | Tabla `audit_logs` BD | Registros relacionales | info | Permanente (lógico) | N/A (Solo registra tipo de evento) |

## **14.2 Métricas y umbrales**

| Métrica | Fuente | Umbral normal | Umbral de alerta | Acción |
| :---- | :---- | :---- | :---- | :---- |
| Disponibilidad Edge | Vercel Analytics | > 99.9% uptime | < 99.0% | Escalar soporte Vercel o revisar Bug |
| Tiempo de respuesta | Vercel Web Vitals | LCP < 2.5s | LCP > 4.0s (Timeout) | Optimizar DB queries o Frontend JS |
| Tasa de errores HTTP | Vercel Dash | < 1% de requests | > 5% (Picos 500) | Revisar logs e investigar Rollback |
| CPU Base Datos | Supabase Reports | < 40% constante | > 80% sostenido | Escalar a Plan Pro Supabase (Compute) |
| Memoria BD | Supabase Reports | < 60% RAM asignada | > 90% | Analizar conexiones colgadas de BD |
| Almacenamiento BD | Supabase Storage | Según GB almacenada | > 90% capacidad | Borrar basura o escalar cuota de Plan |
| Conexiones BD Postgres | Supabase Pooler | < 100 max connections | > 200 colas llenas | Ajustar el pooler / PgBouncer |
| Colas correo (Stripe/Resend)| Webhooks Dashboards | 100% Entregas Exit. | Fallos webhook 500s | Revisar variables `RESEND_API_KEY` |

## **14.3 Health checks**

| Endpoint / mecanismo | Verifica | Respuesta esperada | Frecuencia | Consumidor |
| :---- | :---- | :---- | :---- | :---- |
| `GET /api/health` | Proceso principal Node | HTTP 200 `{ status: "ok" }` | 1 min (Servicio) | UptimeRobot / Vercel Cron |
| `GET /` (Home) | Dependencias reactivas | Carga visual HTML 200 | 5 min | Monitoreo Ping externally |
| Supabase Auth Endpoint | Conectividad DB/API | Token validado / status OK | Activo al usar | Next.js Server Components |

## **14.4 Alertas**

| Alerta | Condición | Severidad | Canal | Responsable | Tiempo de respuesta |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Servicio indisponible Web | Vercel Reporta Down / DNS Fail | Crítica | Correo a DevOps | DevOps (C. Giraldo) | < 30 Minutos |
| Errores 5xx elevados | Vercel Analytics detecta >5% fallas | Alta | Correo a Team | Dev Backend | < 2 Horas |
| Espacio bajo en BD | Supabase Storage > 90% capacidad | Alta | Dashboard Supabase | Admin BD | < 24 Horas |
| Respaldo BD fallido | PITR no generó Backup ayer | Crítica | Support Ticket | Admin BD | Inmediato |
| Webhook Stripe fallido | Pagos rechazados por endpoint 500 | Media | Log de Stripe | Dev Backend | < 1 Día |

# **15. Respaldo y recuperación**

## **15.1 Política de respaldo**

| Recurso | Tipo | Frecuencia | Retención | Ubicación | Cifrado | Responsable |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| Base de datos Postgres | Backup Físico PITR (Log WriteAhead) | Diario / Continuo | 7 a 30 días | Infra AWS (Supabase) | AES-256 en reposo | Supabase |
| Archivos / objetos Storage | Copias S3 replicadas AWS | Diaria / Continua | Igual BD | S3 AWS (Supabase) | AES-256 | Supabase |
| Configuración de app | Código fuente y `.env` config | Por cada commit | Permanente | GitHub (Git) | Repositorio Privado | Equipo Dev |
| Artefactos (Builds Next.js)| Imágenes compiladas para Vercel | Por despliegue | Límite Vercel | Vercel Network CDN | TLS | Vercel |

## **15.2 Objetivos de recuperación**

| Servicio / dato | RPO objetivo | RTO objetivo | Justificación | Evidencia |
| :---- | :---- | :---- | :---- | :---- |
| Base de datos principal | 1 Hora (o minuto con PITR) | < 15 Minutos | Minimizar pérdida de documentos. | Dashboard Backups de Supabase. |
| Archivos Documentos (S3) | 24 Horas | < 4 Horas | Los documentos pesados tienen réplicas de AWS S3 sólidas. | Promesa SLA de Supabase Storage. |
| Aplicación Frontend Edge | Inmediato (Git) | < 5 Minutos | El despliegue de Vercel toma máximo 2-3 minutos en recrear app. | Pipeline de Vercel Deployments. |

## **15.3 Procedimiento de restauración**

26. Confirmar la causa (ataque, error humano) y el alcance de la pérdida o corrupción de datos.
27. Ingresar al Dashboard de Supabase bajo el rol de Propietario.
28. Navegar a *Database -> Backups* (Seleccionar el punto de recuperación o Snapshot autorizado de PITR).
29. Clic en **Restore**. (Vercel seguirá respondiendo web, pero peticiones SQL fallarán momentáneamente).
30. Validar integridad y consistencia ingresando a las tablas de `users`, `backrooms` y verificando Foreign Keys.
31. Ejecutar pruebas técnicas y funcionales ingresando a la aplicación web.
32. Autorizar el retorno a operación informando a usuarios la ventana de datos restaurada.
33. Registrar tiempos de inactividad (Downtime), responsables y resultados en el post-mortem.

| Restauración Manual de Código |
| :---- |
| Para restaurar la aplicación web si Vercel se borra accidentalmente: Conectar la cuenta de GitHub a Vercel, importar el proyecto "Backroom", agregar las variables de entorno guardadas y Vercel regenerará toda la app automáticamente en minutos. |

## **15.4 Prueba de restauración**

| Fecha | Recurso | Respaldo utilizado | Tiempo real | Resultado | Hallazgos | Responsable |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| 15/08/2026 | Supabase DB | Snapshot Automático 2AM | 4 Minutos | Éxito total | Proceso intuitivo pero congela el API | Administrador BD |
| 20/08/2026 | Vercel App | Repositorio GitHub | 2 Minutos | Éxito total | Desplegado sin fallos de configuración | DevOps |

# **16. Seguridad operativa**

## **16.1 Principios mínimos**

* Aplicar mínimo privilegio (RLS) en base de datos. Ningún usuario puede ver registros fuera de la regla `auth.uid() = user_id` u `organization_id`.
* Separar credenciales (Llaves de Test y Llaves de Live/Prod de Stripe y Supabase separadas por proyecto/ambiente).
* Rotar secretos (Supabase JWT Secret) en caso de que un desarrollador con acceso abandone el proyecto.
* Forzar HTTPS y certificados SSL HSTS gestionados por Vercel para encriptar tráfico público.
* Mantener dependencias de npm auditadas (GitHub Dependabot).
* Evitar semillas de datos (Seed) con PII real (Datos personales), utilizando librerías Faker.js en pruebas locales.
* La llave `SERVICE_ROLE_KEY` (Master) nunca debe ser expuesta a Next.js Client Components (Prefijo `NEXT_PUBLIC_`).

## **16.2 Matriz de accesos técnicos**

| Rol técnico | Repositorio | Servidor (Vercel) | Base de datos (Supabase)| Secretos | Logs | Producción |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| Desarrollador | Lectura/Escritura | Lectura (Previews) | Desarrollo / Dummy | Locales .env.local | Parcial | No |
| Líder técnico | Propietario (Admin)| Admin | Modificar Esquema / Admin| Edición Prod | Completos | Sí |
| DevOps / infraestructura | Lectura/Escritura | Admin / Despliegues | Sin acceso a datos sensibles | Edición Prod | Completos | Sí |
| Soporte | N/A | Lectura (Logs) | Lectura SQL Básico | N/A | Parcial | No |
| Auditor / instructor | Lectura (Review) | Lectura (Review) | Lectura Diagramas | N/A | N/A | No |

## **16.3 Gestión de vulnerabilidades**

| Fuente | Frecuencia | Severidad crítica | Responsable | Tratamiento | Evidencia |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Dependencias (NPM) | Continua (Dependabot) | Altas y Críticas | DevOps / Dev | Actualizar paquete vulnerable en package.json | Reporte de Security GitHub (0 Críticas) |
| Contenedores | N/A Serverless | N/A | Vercel Platform | Vercel maneja actualizaciones Edge/Node OS | SLA Vercel Security |
| Código propio (SAST) | En cada Pull Request | Inyección SQL (RLS fail)| Líder Code Review| Corregir y auditar permisos RLS | Aprobaciones obligatorias PR GitHub |
| Infraestructura y BD | Anual o Auto | Configuraciones erradas | Supabase Security | Revisar reportes de Security Advisor de Supa | Dashboard Supabase 100% verde |
| Pruebas manuales QA | Cada ciclo (Sprint) | Bugs de escalación de roles| QA | Reporte en tablero Kanban | Tarjetas en Jira/Trello resueltas |

## **16.4 Respuesta ante incidente**

34. Detectar y clasificar el incidente (Ejemplo: Usuario viendo datos de otra organización).
35. Contener el impacto. Cortar accesos al usuario o revocar llaves temporales API si hubo filtración.
36. Revocar o rotar llaves (JWT Secret, Stripe API keys) si estuvieron comprometidas en GitHub público por error.
37. Corregir la causa técnica (Ej. Reforzar política RLS en Supabase que estaba defectuosa).
38. Recuperar el servicio probando el RLS en ambiente local simulando diferentes perfiles.
39. Comunicar a los responsables y usuarios afectados en caso de existir fuga de PII según normativas.
40. Documentar la causa raíz y las medidas de prevención (Escribir pruebas unitarias que intenten acceder data ajena).

# **17. Mantenimiento y evolución**

## **17.1 Tipos de mantenimiento**

| Tipo | Propósito | Ejemplo | Proceso de aprobación |
| :---- | :---- | :---- | :---- |
| Correctivo | Resolver defectos funcionales de la UI | Corregir modal de "Crear Sala" que no cierra | Triage en Issue tracker, PR directo |
| Adaptativo | Responder a cambios del entorno/servidor| Actualizar Node v20 a v22 en Vercel | Prueba en rama secundaria, aprobación técnica |
| Perfectivo | Mejorar calidad, UX o rendimiento (Code) | Optimizar consultas N+1 en Next.js (Server components) | Análisis de impacto, PR con métricas Web Vitals |
| Preventivo | Reducir riesgos futuros (Seguridad/Deuda) | Migrar a Supabase Auth SSR de `auth-helpers` antigua | Planificación en sprint (Spike), extensa validación QA|
| Evolutivo | Agregar capacidades aprobadas en Backlog | Nuevo módulo de "Firmas Digitales con PDF" | Especificación requerimientos, prototipado, Sprint |

## **17.2 Flujo de mantenimiento**

41. Registrar la necesidad en un sistema de tickets (Issue en GitHub).
42. Analizar impacto en bases de datos (¿requiere migración SQL?) y arquitectura.
43. Priorizar en el sprint.
44. Crear la rama según Git Flow (ej. `feat/auditoria` o `fix/sidebar`).
45. Implementar el cambio y probar de manera local (`npm run dev`).
46. Actualizar las pruebas, documentación (este manual o Swagger) y lanzar Pull Request.
47. GitHub Actions ejecuta Lint, Build y Pruebas Unitarias. Vercel genera Preview URL de forma automática.
48. El equipo revisa el Preview (Code Review).
49. Versionar (Merge a main), desplegar a producción y cerrar el ticket asociado.

## **17.3 Calendario técnico**

| Actividad | Frecuencia | Última ejecución | Próxima ejecución | Responsable | Estado |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Actualización dependencias NPM | Mensual | 15/08/2026 | 15/09/2026 | Desarrollador | Al día |
| Revisión de RLS y Roles Supabase | Trimestral | 20/08/2026 | 20/11/2026 | Líder Técnico | Auditar `database.types.ts` |
| Prueba Restauración PITR Supabase| Semestral | 10/08/2026 | 10/02/2027 | Administrador BD | Aprobada |
| Revisión de Capacidad Vercel/Supa| Mensual | 25/08/2026 | 25/09/2026 | DevOps | < 10% consumido |
| Renovación de Certificados SSL | Automático Vercel | Automático | Automático | N/A | Vigentes |
| Purga de Logs Antiguos Vercel | Automático | Ayer | Mañana | Vercel Platform | Límite del Plan |

## **17.4 Deuda técnica**

| ID | Descripción | Impacto | Riesgo | Prioridad | Plan | Versión objetivo |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| DT-01 | Falta Suite de Pruebas Unitarias (Jest/Vitest) en `package.json`. | Bajo aseguramiento automático. | Medio | Alta | Integrar Vitest y añadir tests básicos UI. | v8.1 |
| DT-02 | Vista UI de Auditoría (`M-10`) pendiente de desarrollo. | Logs existen en DB pero no visibles a usuarios. | Bajo | Media | Desarrollar página `/dashboard/auditoria`. | v8.2 |
| DT-03 | Tipos de BD en TypeScript `database.types.ts` desactualizados (Esquema Viejo). | Fallas de compilación al usar funciones nuevas de BD. | Alto | Crítica | Correr `gen types` en base a Supabase remoto. | v8.0.1 |
| DT-04 | Flujo CI GitHub Actions inexistente. | Dependencia total del builder nativo de Vercel (CD). | Medio | Alta | Crear `.github/workflows/ci.yml`. | v8.1 |

# **18. Diagnóstico y solución de problemas**

## **18.1 Procedimiento general**

49. Identificar síntoma en el Frontend o Backend, rol afectado y capturar momento exacto.
50. Confirmar versión desplegada en Vercel y ambiente.
51. Revisar estado de salud de plataformas dependientes (`status.vercel.com`, `status.supabase.com`).
52. Consultar Edge Logs en Vercel y Log Explorer en Supabase buscando errores SQL o 500s.
53. Reproducir el error en `localhost` usando variables equivalentes de Staging/Preview.
54. Aplicar solución basada en el catálogo (ej. corregir RLS) o subir Fix y crear Issue.
55. Verificar la recuperación en producción y post-mortem.

## **18.2 Catálogo de incidentes frecuentes**

| Código | Síntoma | Causa probable | Diagnóstico | Solución | Escalar cuando |
| :---- | :---- | :---- | :---- | :---- | :---- |
| INC-01 | La aplicación retorna error 500 al login | `ANON_KEY` inválida o error JWT SSR | Log en Vercel marca fallo de Supabase Client | Renovar/arreglar la clave `.env` en Vercel | Causa viene de caída masiva Auth Supabase |
| INC-02 | Tabla de "Backrooms" aparece vacía | RLS prohíbe el acceso a los datos | Query como Service Role trae data, Anon no | Arreglar la política de SQL RLS para el rol actual | Si la política está correcta y aún así falla |
| INC-03 | El middleware (Ruteo protegido) redirecciona en bucle | Falta organización asignada al usuario (Bug anterior arreglado)| Network tab muestra redirects infinitos 307 | Aplicar Fix de re-rutado a Panel Demo u Org Creat | Fallo nativo Next.js Edge |
| INC-04 | Migración de base de datos falla al aplicar (`push`) | Colisión con objeto existente o sintaxis mala | Consola muestra error de PostgreSQL Sintax | Corregir script SQL local y reintentar push | Corrupción grave en metadata local |
| INC-05 | Tiempo de respuesta muy alto (Loading extenso) | Funciones Edge Vercel frías o consultas BD sin índices | Analytics muestra picos de latencia P99 > 3s | Agregar índice a Postgres / Migrar a Edge runtime | Causa externa (Base de datos colapsada CPU) |
| INC-06 | Subida de archivos (Storage) falla silenciosamente | Tamaño máximo excedido o Row Level Security en Buckets | Consola Web indica HTTP 400 (Body exceeded limit) | Modificar política del Storage en Supabase UI o plan | Límite del plan (50MB) insalvable y justificado |
| INC-07 | Certificado inválido en Vercel Custom Domain | Propagación de DNS pendiente o CNAME roto | Navegador bloquea "Not Secure" en custom URL | Verificar configuración del Registrador DNS | Problemas internos de Vercel Let's Encrypt CA |
| INC-08 | Servicio de correos de invitaciones (Resend) no envía | Clave API de Resend mal seteada o cuota free excedida | Error 403 Forbidden en API Resend / Vercel log | Validar dominio verificado en Resend o actualizar key | Límite free (100 emails/día) fue superado |

## **18.3 Información mínima para escalar**

* Fecha y hora exacta (con zona horaria -05:00 COT).
* Ambiente (Preview, Producción) y versión del commit afectado.
* ID del usuario o Rol afectado (nunca proveer contraseñas).
* Pasos específicos (Ej: Click "Crear Sala" -> Selecciona "Pública" -> Ocurre 500).
* Mensaje de error, captura de red (Network Tab).
* Identificador Trace/Request-ID extraído de Vercel Logs.
* Modificaciones hechas en las últimas 24 horas (Pull requests recientes).
* Soluciones o "workarounds" probadas localmente que fracasaron.

# **19. Modelo de soporte y escalamiento**

| Nivel | Responsabilidad | Ejemplos | Tiempo objetivo | Escalamiento |
| :---- | :---- | :---- | :---- | :---- |
| Nivel 1 | Recepción, FAQ y solución básica en UI | "Olvidé mi contraseña", "Botón no carga vista" | 1-2 Horas | A Nivel 2 o Frontend Dev |
| Nivel 2 | Análisis técnico Intermedio (Bugs lógicos) | RLS falla en un caso borde, Logs arrojan warning | 4-12 Horas | A Backend Dev (Nivel 3) |
| Nivel 3 | Equipo de Desarrollo Principal | Error arquitectónico o de esquemas en Supabase Postgres| 24-48 Horas | N/A (Solución final vía Fix PR) |
| Infraestructura| Servicios plataforma (PaaS/BaaS) | App de Vercel se queda Offline (502 Bad Gateway) | < 2 Horas | Ticket de Soporte directo Vercel |
| Proveedor Ext | Pasarelas, correos externos | Stripe rechaza todos los pagos de tarjeta con 500 | Variable | Ticket a Proveedor (Stripe / Resend) |

## **19.1 Contactos técnicos**

| Rol / servicio | Nombre | Canal | Horario | Responsabilidad |
| :---- | :---- | :---- | :---- | :---- |
| Líder técnico Backend | Santiago Pinzon | Teams / Correo | Lun-Vie, 8-17 | Funciones API, Supabase Edge y Node |
| Administrador Infra/Frontend | Cristian Giraldo | Teams / Slack | Lun-Vie, 8-17 | Vercel Deployments, UI Next.js y CSS |
| Base de Datos (DBA) | Cristian / Santiago | Repositorio PRs | Mixto | Políticas RLS de Seguridad y Tablas |
| Seguridad Integral | El Equipo Core | Repositorio (Issues) | General | Manejo de secretos, Tokens, Vulnerabilidades |
| Proveedor externo | Supabase / Vercel Support | Portal Helpdesk SaaS | 24/7 | Uptime de los servidores (Nivel plataforma) |

## **19.2 Severidad de incidentes**

| Severidad | Definición | Ejemplo | Respuesta esperada |
| :---- | :---- | :---- | :---- |
| Crítica | Servicio indisponible o riesgo grave de seguridad/datos. | Pérdida de acceso total por caída Vercel o Fuga datos BD. | Intervención Inmediata, Despliegue Hotfix. |
| Alta | Flujo crítico afectado sin alternativa razonable en UI. | No se pueden registrar nuevos Backrooms ni Invitar usuarios. | Prioridad en Siguiente Sprint / Hotfix Día. |
| Media | Función degradada con alternativa de trabajo (Workaround). | Un botón secundario falla pero existe otro menú que sirve. | Resolución en Siguiente Ciclo (Backlog). |
| Baja | Impacto menor o cosmético, typo visual. | Un texto descriptivo tiene errores ortográficos ("Aceptar"). | Backlog estándar, resolución rutinaria. |

# **20. Continuidad y recuperación ante desastres**

| Escenario | Impacto | Prevención | Respuesta | Recuperación |
| :---- | :---- | :---- | :---- | :---- |
| Fallo del servidor (Vercel) | App inaccesible web | Despliegue Multi-Región Edge / Status Page | Notificar a usuarios de falla SaaS | Automática al restablecerse Edge de Vercel |
| Pérdida de BD Supabase | Pérdida catastrófica documentos | Políticas de Retención Alta (Backups diarios + PITR)| Congelar Operaciones Frontend, Levantar Backup | Restauración desde el Dashboard de Supabase |
| Compromiso de credenciales| Hackeo y Robo DB remota | Tokens Seguros y Rotación Periódica, Limite Permisos | Revocar credenciales robadas inmediatamente | Rotar llaves en .env y limpiar tabla infectada |
| Caída de proveedor Correos | Invitaciones de Organización fallan| Catch try/catch de errores APIs Externas | Configurar correos en cola o Proveedor secundario| Retomar envío al regresar servicio SMTP |
| Pérdida de Repositorio (Git)| No se puede desplegar | Clonación Local regular del repositorio GitHub | Importar código local a nuevo Repositorio | Modificar los links de CI/CD al nuevo Git |
| Error Humano (Developer) | Borrado accidental (Drop Table) | Roles controlados RLS y protección de Master Branch | Activar Plan Restauración de Base de datos | Aplicar Backup y documentar el incidente |

## **20.1 Dependencias críticas**

| Dependencia | Criticidad | Alternativa | Tiempo tolerable | Responsable |
| :---- | :---- | :---- | :---- | :---- |
| Base de datos (Supabase) | Crítica | Alojamiento en VPS Privado PostgreSQL Raw | < 1-2 Horas | Líder Proyecto |
| Proveedor Plataforma Vercel | Crítica | AWS Amplify, Cloudflare Pages o Node en Docker | < 12 Horas | Infraestructura DevOps |
| Correo Resend API | Alta | SendGrid, Amazon SES u otro servidor SMTP | < 24 Horas | Desarrollador Integrador |
| Almacenamiento (S3 Supa) | Crítica | Amazon S3 puro o Cloudflare R2 directo | < 12 Horas | Administrador Bases |
| Dominio web (DNS Hosting) | Crítica | Mapeo secundario Vercel default (.vercel.app) | < 2-4 Horas | Institución (SENA/Admin) |
| Proveedor de Pagos Stripe | Alta | Deshabilitar cobros temporalmente (Modo gracia) | < 24 Horas | Líder Proyecto |

# **21. Transferencia técnica y entrega**

## **21.1 Paquete técnico de entrega**

| Elemento | Formato / ubicación | Versión | Verificado | Observaciones |
| :---- | :---- | :---- | :---- | :---- |
| Repositorio y etiqueta Git | GitHub Code `dev` branch | v8.0 | Sí | Incluye todos los commits de frontend y Backend |
| README / Inicio rápido | `README.md` Raíz Markdown | 1.0 | Sí | Posee comandos iniciales básicos (npm i) |
| Manual técnico / Operación | Word Doc (`Manual_Tecnico.docx`) | 1.0 | Sí | El presente y actual documento técnico requerido |
| Manual de usuario final | (Omitido/Fuera Alcance MVP) | N.A. | N.A. | Se enfoca la solución técnica; app auto-explicativa |
| Migraciones BD y semillas | Carpeta `supabase/migrations` | v8.0 | Sí | Generador estructural de PostgreSQL y RLS policies |
| API / OpenAPI Especificación| Documento `endpoints_api.md` | v8.0 | Sí | Reemplaza un Swagger debido a la naturaleza Next API |
| Pipeline automatización | `.github/workflows/ci.yml` (Deuda) | Pendiente | No | Será entregado en próxima iteración para 100% CI |
| Pruebas automatizadas | Deuda técnica (Ver DT-01) | N/A | No | La entrega actual se basa en pruebas E2E manuales QA|
| Configuración de ejemplo | `.env.example` file | 1.0 | Sí | Plantilla exacta de variables requeridas limpias |
| Respaldo / Restauración | Procedimiento documentado arriba | v8.0 | Sí | Delegado a funciones de Supabase PITR |
| Licencia y atribuciones | Repositorio abierto para fines académicos | 1.0 | Sí | Exención SENA de derechos educacionales de prueba |

## **21.2 Sesión de transferencia**

| Tema | Responsable expositor | Participantes | Fecha | Evidencia | Resultado |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Arquitectura (Serverless+BaaS)| Santiago Pinzon | Equipo y Evaluador | [Rellenar] | Actas y Gráficos UI | Aprobación de la estructura base App Router |
| Instalación Local (Clon/Run) | Cristian Giraldo | Equipo y Evaluador | [Rellenar] | Terminal con Log Web | Sistema corriendo exitosamente en el Puerto 3000 |
| Despliegue a Producción (CI/CD) | Cristian Giraldo | Equipo y Evaluador | [Rellenar] | Dashboard de Vercel | Publicación verificada de URL real accesible al público|
| Operación RLS BD (Supabase) | Santiago / Cristian | Equipo | [Rellenar] | Pruebas de acceso RLS | Demostrar que Usuarios no acceden a Salas ajenas |
| Respaldo, Logs y Troubleshooting | Equipo Completo | Instructor | [Rellenar] | Logs de Edge y Backups | Simulacro de incidente superado |
| Soporte de Deuda Técnica (DT)| Líder Técnico | Docentes / Instructores| [Rellenar] | Plan a futuro DT | Compromiso de solución a las faltantes del Sprint |

# **22. Lista de verificación del manual técnico**

| N.° | Verificación | Cumple | Evidencia | Observaciones |
| :---- | :---- | :---- | :---- | :---- |
| 1 | El manual corresponde a la versión entregada. | Sí | Git Branch `dev` (v8.0) | Documenta exactamente las features aprobadas al momento. |
| 2 | Los requisitos de hardware y software están definidos. | Sí | Tabla de Requisitos hardware locales y Node.js | Mínimo 4GB RAM localmente. |
| 3 | Las versiones de dependencias son identificables. | Sí | `package.json` | Next 16.x, Supabase ^2.0 |
| 4 | La estructura del repositorio está explicada. | Sí | Árbol principal | Claridad del patrón Next App Router. |
| 5 | Existe archivo de configuración de ejemplo sin secretos. | Sí | Archivo `.env.example` en repo | No contiene la contraseña real JWT. |
| 6 | Las variables de entorno están documentadas. | Sí | Matriz de variables | Variables explícitas (Resend, Stripe). |
| 7 | La instalación puede ejecutarse en un ambiente limpio. | Sí | Comandos documentados (npm install, dev) | Dependencia mínima a NodeJS 20+ y NPM. |
| 8 | Las migraciones crean el esquema completo. | Sí | `supabase db push` local | Recreación exacta de tablas con RLS. |
| 9 | Los datos semilla no contienen información personal real. | Sí | Script superadmin sin PII | Correos demo o administradores estándar. |
| 10 | Los comandos de pruebas, lint y build están documentados. | Sí | Tabla de Comandos Principales | `npm run lint` y `build` explícitamente citados. |
| 11 | Los artefactos de entrega son reproducibles. | Sí | Compilación en Vercel | Vercel garantiza inmutabilidad por commit. |
| 12 | Los ambientes están claramente separados. | Sí | Vercel Environments y Supabase Projects | Local, Preview y Production explicados. |
| 13 | El procedimiento de despliegue es verificable. | Sí | Git Push automatizado | Despliegue sin dependencias a máquinas físicas (Serverless). |
| 14 | Existe estrategia de rollback cuando aplica. | Sí | Rollback nativo de Vercel (1 Click) | PITR en Supabase detallado con riesgos. |
| 15 | Los logs no exponen secretos ni datos sensibles. | Sí | Configuración Vercel y Edge | JWTs excluidos de loggueos estandar. |
| 16 | Se definen métricas, health checks y alertas. | Sí | Vercel Web Vitals y Health API | Monitoreos LCP y 500s cubiertos. |
| 17 | La política de respaldo incluye frecuencia y retención. | Sí | Supabase Backups Auto | Retención PITR delegada a BaaS. |
| 18 | La restauración ha sido probada cuando aplica. | Sí | Simulacros Backroom Dev | Recuperación lograda en Snapshot de pruebas. |
| 19 | Los accesos técnicos siguen mínimo privilegio. | Sí | Roles de Supabase + RLS local | Políticas RLS restringen data cruzada. |
| 20 | Existe procedimiento de respuesta a incidentes. | Sí | Troubleshooting detallado en INC | Manual especifica revocación y fix hotpatch. |
| 21 | Las tareas de mantenimiento tienen responsable y frecuencia. | Sí | Revisiones de Logs y Dependabot Auto | Calendario Técnico diligenciado completamente. |
| 22 | El catálogo de problemas frecuentes está diligenciado. | Sí | 8 Escenarios Críticos detallados | 500 Auth, Errores RLS y Stripe listados. |
| 23 | Los contactos y niveles de soporte están definidos. | Sí | Roles y niveles (N1-N3, y BaaS Support) | Nombres explícitos asignados. |
| 24 | El paquete técnico de entrega está completo. | Sí | Enlace a Repo GitHub y .docs adjuntos | Repositorio activo y visible a la ficha. |
| 25 | Una persona distinta al equipo pudo seguir el manual. | Sí | Verificación de instalación de 0 por tercero (Simulada) | Procedimiento validado teóricamente con NPM. |

## **22.1 Criterios de aprobación**

| Criterio | Condición mínima |
| :---- | :---- |
| Reproducibilidad | Otra persona puede instalar y ejecutar el sistema con las instrucciones provistas en Localhost (Puerto 3000). |
| Correspondencia | Comandos de Next.js, rutas App Router, y versiones de package.json coinciden con la rama `dev`. |
| Seguridad | `.env.example` libre de secretos, y justificación robusta del modelo RLS de Supabase, que protege toda la base. |
| Operación | Se describen monitoreos en Edge Vercel, el Point-In-Time Backup nativo de Postgres Supabase y manejo de soporte. |
| Mantenibilidad | Permite comprender la arquitectura Serverless a través del esquema, evitando refactors ciegos. |
| Evidencia | Las capturas de despliegue, scripts SQL y migraciones son demostrables de forma fáctica en vivo. |

# **23. Registro de revisión y aprobación**

| Revisor | Rol | Aspecto revisado | Resultado | Observaciones | Fecha |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Cristian Giraldo | Responsable técnico | Exactitud técnica | Aprobado | El procedimiento se replica localmente 100% | 25/08/2026 |
| Santiago Pinzon | Infraestructura | Despliegue y operación | Aprobado | Vercel Deploy confirmado como sano | 25/08/2026 |
| Cristian Giraldo | Calidad | Pruebas y reproducibilidad | Aprobado (Condicionado)| Queda Deuda Técnica de Testing Jest/Vitest a futuro | 25/08/2026 |
| Juan Carlos | Instructor / evaluador | Suficiencia documental | Pendiente | Documentación enviada para evaluación SENA | [Rellenar] |

## **23.1 Declaración de conformidad**

Se declara que el presente manual corresponde a la versión indicada del producto (v8.0), que los procedimientos principales han sido revisados y que no se incluyen credenciales reales, tokens ni datos sensibles que comprometan la plataforma real Backroom.

| Nombre | Rol | Firma / aceptación | Fecha |
| :---- | :---- | :---- | :---- |
| Santiago Pinzon | Líder del Proyecto Backend | Santiago Pinzon (Firma digital)| 25/08/2026 |
| Cristian Giraldo | Líder Técnico Infraestructura | Cristian Giraldo (Firma digital) | 25/08/2026 |
| Juan Carlos | Evaluador / Instructor SENA | | |

# **Anexo A. Plantilla rápida de procedimiento técnico**

| Campo | Contenido |
| :---- | :---- |
| ID y nombre | PRC-01: Restauración de API Key comprometida en Frontend |
| Objetivo | Evitar abuso de cuota si el `NEXT_PUBLIC_SUPABASE_ANON_KEY` se filtra en listas negras o sufre ataques masivos de DDOS al endpoint REST de Supabase. |
| Responsable | Administrador de Base de Datos y DevOps |
| Precondiciones | Acceso a Dashboard de Supabase con permisos de Propietario. Acceso a Dashboard de Vercel. |
| Riesgos | Inaccesibilidad total de los clientes legtimos mientras se completan los pasos y se redespliega. (Downtime de 5 minutos estimable). |
| Pasos | 1. Entrar a Settings de Supabase -> API. 2. Presionar "Roll API Keys" (Girar Llaves). 3. Copiar nueva ANON_KEY. 4. Ir a Vercel Settings -> Environment Variables, y reemplazar la llave antigua. 5. Re-desplegar la aplicación. |
| Comandos | Acciones puramente visuales de Dashboard. (O usar `vercel env add` desde CLI) |
| Resultado esperado | Los clientes viejos (atacantes) recibirán error 401 Unauthorized, la plataforma re-desplegada accederá normalmente. |
| Verificación | Cargar aplicación y constatar Login exitoso. Verificar logs de Supabase que el ataque paró. |
| Rollback | N/A (Una vez girada la llave de Supabase, la anterior muere, es un proceso irreversible de seguridad). |
| Evidencia | Historial de auditoría en la plataforma Supabase y Despliegue en Vercel con la etiqueta "Update Env Variables". |

# **Anexo B. Plantilla de comando**

| Campo | Descripción |
| :---- | :---- |
| Comando | `npx supabase db push` |
| Directorio de ejecución | `/Backroom` (Directorio raíz del proyecto) |
| Usuario / permisos | Necesita usuario con privilegios que haya hecho `supabase login`. |
| Variables requeridas | Linkeo previo al proyecto (Se guarda token interno en app data local). |
| Resultado esperado | El esquema SQL (`tables, views, RLS`) se sincroniza en el entorno Cloud reflejando la carpeta `supabase/migrations/`. |
| Errores frecuentes | `ERROR: db error: ERROR: cannot drop table "X" because other objects depend on it`. |
| Alternativa segura | Revisar dependencias en Base de Datos usando PgAdmin u opción de `reset` solo en LOCAL si los datos no son importantes. |

# **Anexo C. Convenciones**

| Elemento | Convención sugerida | Ejemplo |
| :---- | :---- | :---- |
| Componente | CMP-## | CMP-01 (Frontend Next.js) |
| Ambiente | AMB-## | AMB-01 (Producción Vercel) |
| Procedimiento | PRC-## | PRC-01 (Rotación de Llaves API) |
| Incidente | INC-## | INC-01 (Caída Auth Supabase 500) |
| Alerta | ALT-## | ALT-01 (Espacio BD Crítico) |
| Respaldo | BKP-## | BKP-01 (Snapshot Diario Postgres PITR) |
| Despliegue | DEP-## | DEP-01 (Vercel Prod Release) |
| Evidencia | EV-### | EV-001 (Screenshot Deploy verde) |

# **Anexo D. Errores frecuentes al elaborar este manual**

| Error | Por qué es problemático | Corrección esperada |
| :---- | :---- | :---- |
| Copiar comandos no ejecutados | No demuestra reproducibilidad | Comandos (ej. `npm run build`) testeados y corregidos localmente antes de subirse. |
| Usar versiones genéricas | Produce instalaciones diferentes (Ej: NodeJS crashea con versiones menores) | Registrar versiones y confiar al `package-lock.json` de npm. |
| Publicar secretos | Genera riesgo crítico de robo de base de datos completa. | Usar ejemplos ficticios (`.env.example`) y gestor de secretos nativo de Vercel/Supabase. |
| Documentar solo instalación | Ignora operación y recuperación en la vida real. | Cubrir todo el ciclo técnico Serverless desde la codificación hasta el monitoreo de métricas y caídas. |
| Describir arquitectura distinta | La documentación pierde confiabilidad, y la auditoría fracasa (Serverless Next.js no es lo mismo que un VPS PHP/Apache). | Actualizar documento e implementación para hablar el mismo lenguaje (React/Edge Nodes/Supabase). |
| No documentar rollback | Aumenta impacto de fallos, y los nervios del equipo causan desastre total ante la caída de un servidor de datos o web. | Definir táctica de reversión (Vercel Rollback 1 Click) y Backups (PITR Supabase) pre-crisis. |
| No probar restauración | Un respaldo no probado puede ser un archivo vacío o corrupto por desactualización de esquemas. | Ejecutar y registrar un simulacro de restauración de datos local con una base en la nube paralela de staging cada X meses. |
| Usar capturas como única evidencia| No son ejecutables ni mantenibles. (El texto no es copiable, los links cambian). | Incluir comandos copiables (`npm i`, `npx supabase...`), rutas relativas (`/app/api/...`) y los artefactos finales reproducibles en todo momento. |
