**SERVICIO NACIONAL DE APRENDIZAJE – SENA**

**TECNOLOGÍA EN ANÁLISIS Y DESARROLLO DE SOFTWARE – ADSO**

**MANUAL TÉCNICO Y DE OPERACIÓN**

Plantilla institucional para instalación, configuración, despliegue,
operación, mantenimiento, respaldo y recuperación

| Campo | Información |
| :---- | :---- |
| Nombre del proyecto | BackRoom - Plataforma de Gestión Documental |
| Centro de formación | [Para rellenar por el usuario] |
| Regional | [Para rellenar por el usuario] |
| Ficha | [Para rellenar por el usuario] |
| Equipo responsable | [Para rellenar por el usuario] |
| Instructor(es) | [Para rellenar por el usuario] |
| Versión del producto | 8.0 (MVP) - Build 0.1.0 |
| Versión del documento | 1.0 |
| Fecha | [Para rellenar por el usuario] |
| Clasificación | Documento técnico controlado |

| Finalidad del manual |
| :---- |
| Permitir que una persona técnica diferente al equipo autor pueda instalar, configurar, ejecutar, desplegar, mantener, diagnosticar y recuperar el sistema siguiendo instrucciones verificables y sin depender de conocimiento informal o configuraciones ocultas. |

# **Control documental**

| Versión | Fecha | Descripción del cambio | Elaboró | Revisó | Aprobó | Estado |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| 1.0 | [Fecha] | Versión inicial del manual | [Tú] | [Instructor] | [Instructor] | Borrador |
| 1.1 | [Fecha] | Ajustes en arquitecturas Serverless | [Tú] | [Tú] | [Tú] | En revisión |

## **Aprobaciones**

| Rol | Nombre | Responsabilidad de validación | Fecha | Firma / aprobación |
| :---- | :---- | :---- | :---- | :---- |
| Responsable técnico | [Tú] | Exactitud de instalación, configuración y operación | [Fecha] | [Firma] |
| Líder del proyecto | [Tú] | Correspondencia con la versión entregada | [Fecha] | [Firma] |
| Instructor / evaluador | [Nombre] | Verificabilidad y suficiencia técnica | [Fecha] | [Firma] |
| Administrador de infraestructura | [Tú] | Despliegue y operación, cuando aplique | [Fecha] | [Firma] |

## **Estado del documento**

| Estado | Descripción |
| :---- | :---- |
| Borrador | Documento en construcción; aún no debe usarse como referencia operativa definitiva. |
| En revisión | Contenido sometido a validación técnica y funcional. |
| Aprobado | Documento autorizado para la versión indicada del producto. |
| Obsoleto | Documento reemplazado por una versión posterior; se conserva solo como histórico. |

# **1. Propósito y alcance del manual**

Este manual documenta los procedimientos técnicos y operativos necesarios para reproducir, desplegar y mantener el sistema BackRoom. Debe corresponder con el código fuente, la arquitectura (Next.js + Supabase), las variables de entorno, las migraciones de PostgreSQL, los scripts y la versión realmente entregada.

| Regla de consistencia |
| :---- |
| Toda instrucción incluida debe poder ejecutarse. Los comandos, rutas, nombres de servicios, puertos, variables y dependencias deben coincidir con el repositorio y con el ambiente entregado. Una explicación elegante pero imposible de reproducir no cumple el propósito del manual. |

## **1.1 Objetivos específicos**

* Describir los requisitos de hardware, software, red y acceso para un entorno local y en la nube.
* Explicar la estructura del repositorio monorepo de Next.js.
* Documentar la configuración de variables (.env) de Supabase, Resend y Stripe.
* Establecer procedimientos reproducibles de instalación vía npm, migraciones vía Supabase CLI.
* Definir el despliegue en Vercel (Frontend/Backend) y Supabase (Database/Auth).
* Documentar monitoreo, logs, y políticas de respaldo de Supabase.
* Proveer guía de diagnóstico y solución de problemas (Troubleshooting).

## **1.2 Audiencia**

| Perfil | Uso esperado del manual | Conocimiento mínimo |
| :---- | :---- | :---- |
| Desarrollador | Instalación local, pruebas, mantenimiento y evolución | React, Next.js, TypeScript, Git, PostgreSQL |
| Administrador de sistemas | Despliegue, configuración, monitoreo y recuperación | SO, Serverless, BaaS (Supabase), Vercel |
| DevOps / responsable de infraestructura | CI/CD, ambientes, secretos y observabilidad | GitHub Actions, Vercel CLI |
| Instructor / evaluador | Comprobar reproducibilidad, operación y calidad | Fundamentos de desarrollo y despliegue |
| Soporte técnico | Diagnóstico de incidentes y recuperación básica | Uso de logs en Vercel y Supabase |

## **1.3 Fuera de alcance**

| Elementos no cubiertos por este manual |
| :---- |
| 1. Formación de usuarios finales sobre el uso de la interfaz de BackRoom.<br>2. Negociación y administración de contratos con proveedores externos (Vercel, Supabase, Stripe).<br>3. Cambios funcionales de características marcadas como "Backlog" (ej. HU-FUT-02). |

# **2. Documentos y artefactos relacionados**

| Documento / artefacto | Código o ubicación | Versión | Relación con este manual |
| :---- | :---- | :---- | :---- |
| Arquitectura y Diseño | `BackroomDocumentation/docs/` | v8.0 | Fuente de estructura y componentes |
| Plan de Calidad y Pruebas | `BackroomDocumentation/docs/` | v8.0 | Comandos y criterios de verificación |
| Alcance y Requisitos | `BackroomDocumentation/.../requerimientos.md` | v8.0 | Restricciones técnicas y operativas |
| README | `proyecto/Backroom/README.md` | 1.0 | Inicio rápido y comandos principales |
| Catálogo API | `docs/diseno/endpoints_api.md` | v8.0 | Operación e integración API |
| Migraciones BD | `proyecto/Backroom/supabase/migrations` | v1.0 | Creación y evolución de base de datos |
| Reporte de Calidad | `REPORTE_CALIDAD_CODIGO.md` | v1.0 | Estado del código y deuda técnica |
| Features y Vistas | `FEATURES_Y_VISTAS_PENDIENTES.md` | v8.0 | Estado real de desarrollo |

# **3. Identificación técnica del producto**

| Campo | Valor |
| :---- | :---- |
| Nombre técnico del sistema | BackRoom App |
| Versión o etiqueta Git | v0.1.0-alpha / branch: dev |
| Repositorio principal | github.com/krlcfr/Backroom |
| Rama de entrega | main / dev |
| Tipo de solución | Aplicación Web (SSR + SPA) y API Serverless |
| Arquitectura general | Serverless API (Next.js) + Backend as a Service (Supabase PostgreSQL) |
| Licencia | Propietaria / Educativa |
| Propietario técnico | [Nombre del Equipo] |
| Canal de soporte | [Correo del equipo] |
| Ambiente de referencia | Vercel (Producción) |

## **3.1 Resumen tecnológico**

| Capa / servicio | Tecnología | Versión | Función | Fuente de versión |
| :---- | :---- | :---- | :---- | :---- |
| Frontend | React + Tailwind CSS | 19.2 / v4 | Interfaz de Usuario UI | package.json |
| Backend | Next.js (App Router) | 16.2.10 | Renderizado de servidor y Rutas API | package.json |
| Base de datos | PostgreSQL (Supabase) | 15+ | Almacenamiento relacional | supabase/config.toml |
| ORM / Cliente BD | @supabase/supabase-js | ^2.0 | Conexión y consultas tipadas | package.json |
| Envío de correos | Resend | ^6.20 | Correos transaccionales e invitaciones | package.json |
| Pagos | Stripe | ^22.5 | Pasarela de suscripciones | package.json |
| Runtime | Node.js | v20+ | Entorno de ejecución de JS | package.json (engines) |

## **3.2 Componentes desplegables**

| ID | Componente | Artefacto generado | Puerto / endpoint | Dependencias | Responsable |
| :---- | :---- | :---- | :---- | :---- | :---- |
| CMP-01 | Next.js App | Build Serverless | Puerto 3000 / https | Node.js 20+ | Equipo Dev |
| CMP-02 | API Routes | Serverless Functions | /api/* | Supabase, Stripe, Resend | Equipo Dev |
| CMP-03 | Base de Datos | Instancia PostgreSQL | Puerto 5432 / TCP | N/A | Supabase |
| CMP-04 | Supabase Auth | Servicio JWT | Supabase URL | Base de Datos | Supabase |

# **4. Requisitos de infraestructura**

## **4.1 Requisitos mínimos y recomendados**

| Recurso | Mínimo (Local) | Recomendado (Producción) | Observaciones |
| :---- | :---- | :---- | :---- |
| CPU | 2 Cores | Auto-escalable (Vercel) | |
| Memoria RAM | 4 GB | 1024 MB por función | Serverless RAM en Vercel |
| Almacenamiento | 2 GB libre | 500 MB (Supabase DB) | 50GB en Storage para recursos |
| Sistema operativo | Windows 10/11 / Linux | Vercel Linux OS | Desarrollo multiplataforma |
| Conectividad | 10 Mbps | Alta disponibilidad | Requerido para npm y Supabase |
| Navegador / cliente | Chrome 90+, Edge 90+ | Chrome/Safari/Firefox modernos | Interfaz basada en estándares |
| Resolución / dispositivo | 1024x768 | 1920x1080 | Diseño Responsive |

## **4.2 Dependencias de software**

| Dependencia | Versión exacta o rango | Obligatoria | Instalación / fuente | Verificación |
| :---- | :---- | :---- | :---- | :---- |
| Git | >= 2.30 | Sí | git-scm.com | `git --version` |
| Node.js | >= 20.x | Sí | nodejs.org | `node -v` |
| npm | >= 10.x | Sí | Instalado con Node | `npm -v` |
| Supabase CLI | >= 1.200 | No (opcional DB local)| supabase.com/docs | `supabase -v` |
| Docker Desktop | >= 4.0 | No (opcional DB local)| docker.com | `docker --version` |

## **4.3 Puertos, protocolos y conectividad**

| Servicio | Puerto | Protocolo | Origen permitido | Destino | Justificación |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Frontend Local | 3000 | HTTP | localhost | Máquina local | Desarrollo |
| Supabase Studio | 54323 | HTTP | localhost | Docker container | Interfaz BD local |
| Backend API | 443 | HTTPS | Any / API Gateway | Vercel Edge | Tráfico en producción |
| Base de datos | 5432 | TCP (TLS) | IPs de Vercel | Supabase Cloud | Acceso seguro a DB |

## **4.4 Cuentas y accesos requeridos**

| Recurso | Tipo de acceso | Rol mínimo | Responsable de otorgar | Procedimiento |
| :---- | :---- | :---- | :---- | :---- |
| GitHub | Lectura / Escritura | Collaborator | Líder técnico | Invitación al repositorio |
| Vercel | Admin / Despliegue | Member | DevOps | Invitación a Vercel Team |
| Supabase Cloud | Owner / Developer | Developer | Administrador | Invitación a Supabase Org |
| Resend | Developer | Member | Administrador | Generación de API Keys |
| Stripe | Configuración pagos | Developer | Administrador | Obtención de claves Test/Live |

# **5. Estructura del repositorio**

| Criterio de mantenibilidad |
| :---- |
| La estructura sigue el patrón App Router de Next.js, separando lógica de servidor de la lógica del cliente. La base de datos es manejada mediante Supabase Migrations de forma declarativa. |

## **5.1 Árbol principal**

```
Backroom/
├── app/                  # Rutas y páginas de Next.js (Frontend y Backend API)
├── components/           # Componentes UI reutilizables (layout, auth, modales)
├── lib/                  # Lógica de negocio, utilidades (supabase, auth, limits)
├── public/               # Assets estáticos, logos e imágenes
├── supabase/
│   ├── migrations/       # Archivos SQL con los cambios estructurales de BD
│   └── config.toml       # Configuración local de Supabase
├── types/                # Interfaces TypeScript y Supabase DB Types
├── package.json          # Dependencias y scripts NPM
└── next.config.ts        # Configuración del empaquetador Turbopack/Webpack
```

## **5.2 Descripción de directorios**

| Ruta | Contenido | Responsabilidad | Artefactos principales |
| :---- | :---- | :---- | :---- |
| `/app` | Next.js App Router | Enrutamiento web y de API | `page.tsx`, `layout.tsx`, `route.ts` |
| `/app/api` | API Endpoints | Procesamiento de peticiones backend | Controladores de Auth, Organizaciones, etc. |
| `/components` | React Components | Reusabilidad de interfaz | Botones, Tablas, Formularios |
| `/lib/supabase` | Configuración Cliente | Proveer conexión SSR y Client a Supabase | `server.ts`, `client.ts`, `middleware.ts` |
| `/supabase/migrations` | Scripts SQL | Control de versiones de la BD | `2024..._init.sql` |
| `/types` | Definiciones TS | Tipado estático | `database.types.ts` |

## **5.3 Archivos fundamentales**

| Archivo | Propósito | Debe contener | No debe contener |
| :---- | :---- | :---- | :---- |
| `README.md` | Inicio rápido | Descripción, instalación, comandos y enlaces | Información desactualizada |
| `.env.example` | Variables requeridas | Nombres de variables y valores ficticios o de API públicas | Secretos, Passwords o JWT secrets reales |
| `supabase/config.toml`| Config Supabase | Puertos de docker, settings locales | Credenciales de producción |
| `package.json` | Dependencias | Listado de librerías y versiones usadas | Dependencias en desuso |
| `middleware.ts` | Edge Middleware | Lógica de enrutamiento y sesión de Next.js | Consultas pesadas a la BD |

# **6. Configuración y gestión de variables**

## **6.1 Matriz de variables de entorno**

| Variable | Descripción | Tipo | Obligatoria | Valor de ejemplo | Secreto | Ambientes |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL de la API REST BD | URL | Sí | `https://abcde.supabase.co` | No | Todos |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Llave pública de cliente | JWT | Sí | `eyJhb...` | No | Todos |
| `SUPABASE_SERVICE_ROLE_KEY` | Llave maestra (Admin) | JWT | Cond. | `eyJhb...` | Sí | Solo Node (Backend) |
| `RESEND_API_KEY` | Llave para envío de correos | String | No | `re_12345...` | Sí | Solo Backend |
| `STRIPE_SECRET_KEY` | Llave privada de pagos | String | No | `sk_test_123...` | Sí | Solo Backend |
| `NEXT_PUBLIC_APP_URL` | URL del frontend | URL | Sí | `http://localhost:3000` | No | Todos |

| Seguridad obligatoria |
| :---- |
| Ninguna llave de servicio (`SERVICE_ROLE_KEY` o Secret Keys) debe contener el prefijo `NEXT_PUBLIC_`. Las variables en `.env.local` nunca deben ser subidas al repositorio de GitHub. |

## **6.2 Configuración por ambiente**

| Aspecto | Desarrollo (Local) | Pruebas (Preview) | Producción |
| :---- | :---- | :---- | :---- |
| Base de datos | Supabase Local (Docker) / Proyecto Dev | Proyecto Supabase Staging | Proyecto Supabase Producción |
| Nivel de logs | Verbose / Console | Warn / Error | Error |
| Dominio / URL | `localhost:3000` | `*.vercel.app` | `backroom.vercel.app` |
| Stripe | Modo Test (sk_test_) | Modo Test (sk_test_) | Modo Live (sk_live_) |
| Datos permitidos | Ficticios o sembrados (`seed.sql`) | Ficticios o anonimizados | Reales controlados |
| Depuración | Permitida (React DevTools) | Limitada | Deshabilitada |
| Secretos | `.env.local` seguro | Vercel Environment Variables | Vercel Environment Variables |

## **6.3 Verificación de configuración**

1. Renombrar `.env.example` a `.env.local`
2. Insertar valores del proyecto de Supabase (Project Settings -> API).
3. Verificar que las variables del cliente (`NEXT_PUBLIC_`) funcionan haciendo `console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)` en un componente de prueba.
4. Validar que la API Key de Resend esté conectada al dominio correcto.

# **7. Instalación y ejecución en ambiente local**

## **7.1 Preparación**

1. Instalar Node.js v20.x y Git.
2. Clonar el repositorio `git clone https://github.com/krlcfr/Backroom`.
3. Ingresar al directorio `cd Backroom`.
4. Copiar variables de entorno: `cp .env.example .env.local` y llenar los datos.
5. Instalar dependencias con `npm install`.
6. En caso de usar BD local: Iniciar Docker e iniciar Supabase con `npx supabase start`.
7. Sembrar la base de datos de administradores: `npm run seed:superadmin`.
8. Ejecutar el servidor de desarrollo `npm run dev`.
9. Acceder a `http://localhost:3000`.

## **7.2 Comandos de instalación**

| Paso | Comando | Resultado esperado | Evidencia / verificación |
| :---- | :---- | :---- | :---- |
| Clonar repositorio | `git clone [url]` | Código descargado | Directorio `Backroom` |
| Seleccionar rama | `git checkout dev` | Cambio de rama | `git status` |
| Instalar dependencias | `npm install` | Instalación sin errores | Carpeta `node_modules` |
| Crear configuración | `cp .env.example .env.local`| Archivo creado | Variables completadas |
| Preparar base de datos | `npx supabase db push` | Esquema aplicado a DB remota o local | DB actualizada |
| Iniciar aplicación | `npm run dev` | Servidor levantado | Next.js en consola |

## **7.3 Verificación inicial**

| Verificación | Método | Resultado esperado | Cumple |
| :---- | :---- | :---- | :---- |
| Compilación / build | `npm run build` | Finaliza sin errores, genera `.next` | Sí |
| Conexión a base de datos | `npx supabase status` | Conexión exitosa, Supabase APIs vivas | Sí |
| Inicio de sesión de prueba | Login UI en `http://localhost:3000/login` | Acceso al dashboard / Modo Demo | Sí |
| Logs | Consola de Next.js | Sin errores 500, ni fallos TS | Sí |

# **8. Base de datos, migraciones y datos semilla**

## **8.1 Creación y configuración**

La base de datos es proporcionada por Supabase (PostgreSQL 15+). Se crea automáticamente al inicializar un proyecto en la plataforma web de Supabase.
Las extensiones requeridas y la codificación de zona horaria (UTC) están preconfiguradas. Se utiliza `Row Level Security (RLS)` para proteger el acceso a los datos (Organizaciones, BackRooms, Salas).

## **8.2 Migraciones**

Backroom utiliza Supabase CLI para el control de versiones del esquema de base de datos.

| Operación | Comando / procedimiento | Precondición | Resultado esperado | Rollback |
| :---- | :---- | :---- | :---- | :---- |
| Aplicar migraciones local | `npx supabase db reset` | Docker encendido | Recrea BD e inserta migraciones | Automático (recrea) |
| Aplicar migraciones remoto | `npx supabase db push` | Credenciales linkeadas (`supabase link`) | Migraciones aplicadas al servidor | Restauración BD |
| Crear nueva migración | `npx supabase migration new nombre` | CLI instalado | Archivo .sql en `supabase/migrations` | Borrar archivo .sql |
| Generar tipos de TS | `npx supabase gen types typescript --local > types/database.types.ts` | BD viva | Tipos actualizados | `git restore` |

## **8.3 Datos semilla**

| Conjunto | Finalidad | Ambiente permitido | Comando | Contiene datos personales |
| :---- | :---- | :---- | :---- | :---- |
| SuperAdmin Seed | Insertar usuario admin con plan Enterprise | Desarrollo / Producción | `npm run seed:superadmin` | No (credenciales genéricas) |
| Semilla Local | Datos Dummy locales de Supabase | Desarrollo | `supabase/seed.sql` ejecutado en reset | No |

## **8.4 Integridad y mantenimiento**

* Integridad referencial mediante FKs con borrado en cascada (ej: Eliminar BackRoom elimina sus Salas y Recursos).
* Row Level Security (RLS) habilitado en TODAS las tablas.
* Índices B-Tree aplicados a columnas `organization_id`, `parent_id` y claves de foráneas de alto tráfico.

# **9. Compilación, pruebas y verificación técnica**

## **9.1 Comandos principales**

| Actividad | Comando | Ambiente | Criterio de éxito |
| :---- | :---- | :---- | :---- |
| Lint | `npm run lint` | Local / CI | Sin errores críticos de ESLint |
| Formato y TS | `npx tsc --noEmit` | Local / CI | Compilación TS sin errores |
| Build | `npm run build` | Local / CI | Artefacto `.next` generado, rutas renderizadas |

## **9.2 Criterios antes de desplegar**

| Control | Obligatorio | Evidencia | Responsable | Estado |
| :---- | :---- | :---- | :---- | :---- |
| Build reproducible | Sí | Comando `npm run build` exitoso | Desarrollador | OK |
| Migraciones aplicadas | Sí | `supabase db push` sin conflictos | Líder técnico | OK |
| Secretos configurados | Sí | En dashboard de Vercel y Supabase | DevOps | OK |

# **10. Construcción y artefactos de entrega**

| Artefacto | Ruta de generación | Comando | Contenido | Destino |
| :---- | :---- | :---- | :---- | :---- |
| Frontend compilado | `.next/` | `npm run build` | HTML/CSS/JS estático y pre-renderizado | Vercel CDN |
| Backend Serverless | `.next/server/app/api` | `npm run build` | Funciones lambda de la API | Vercel Edge / Node |
| Migraciones SQL | `supabase/migrations` | N/A | DDL y DML estructurado | Base de datos |

## **10.1 Versionamiento**

| Elemento | Convención | Ejemplo | Responsable |
| :---- | :---- | :---- | :---- |
| Versión de producto | Semantic Versioning | 0.1.0 | Líder de proyecto |
| Migración | Timestamp CLI | `20240825_add_table.sql`| Desarrollador |

# **11. Despliegue por ambiente**

## **11.1 Inventario de ambientes**

| Ambiente | Propósito | URL / host | Responsable | Datos | Acceso |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Desarrollo | Pruebas locales y construcción | `localhost:3000` | Equipo | Ficticios | Local |
| Pruebas / Preview | Revisión de Pull Requests | `*.vercel.app` (Previews) | DevOps | Ficticios / Copias | Solo lectura / QA |
| Producción | Uso real de clientes | `backroom.vercel.app` (o dominio real)| Administrador | Reales | Usuarios y SuperAdmins |

## **11.2 Procedimiento de despliegue**

1. Hacer merge de la rama `feature` a `main` (o `dev` si se usa entorno de staging).
2. Aplicar manualmente las migraciones al entorno de base de datos de producción mediante `supabase db push` (requiere estar logueado vía CLI).
3. Vercel detecta automáticamente el commit en `main` gracias a la integración con GitHub.
4. Vercel ejecuta `npm run build`.
5. Si el build es exitoso, Vercel intercambia el tráfico a la nueva versión (Despliegue inmutable atómico).
6. Ejecutar pruebas de humo (Smoke Tests) visitando la URL de producción.

## **11.3 Registro de despliegue**

| Fecha / hora | Ambiente | Versión | Responsable | Migraciones | Resultado | Evidencia |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| [Fecha] | Producción | v0.1.0 | DevOps | Sí (v8.0 MVP) | Éxito | Dashboard Vercel |

## **11.4 Pruebas de humo posteriores**

| ID | Verificación | Resultado esperado | Resultado real | Estado |
| :---- | :---- | :---- | :---- | :---- |
| SMK-01 | Acceso principal | Interfaz web carga y responde en <2s | Exitoso | Aprobado |
| SMK-02 | Autenticación | Login exitoso y redirección al Dashboard | Exitoso | Aprobado |
| SMK-03 | Operación crítica | Posibilidad de cargar un archivo (Recurso) | Exitoso | Aprobado |

# **12. Reversión y recuperación ante despliegue fallido**

| Condición crítica |
| :---- |
| Si el despliegue introdujo migraciones destructivas a la base de datos (por ejemplo, eliminación de una columna usada en producción), el rollback en Vercel NO resolverá el problema por sí solo y provocará un crash en la versión restaurada. Se requiere recuperación de BD. |

## **12.1 Criterios para activar rollback**

* Vercel reporta tasas de error (500) superiores al 10% en el dashboard.
* Errores de "Hydration" de React masivos para los clientes.
* Corrupción detectada en consultas Supabase debido a RLS mal configurado.

## **12.2 Procedimiento de rollback**

| Paso | Acción | Responsable | Comando / procedimiento | Verificación |
| :---- | :---- | :---- | :---- | :---- |
| 1 | Rollback en Vercel | DevOps | Vercel Dashboard -> Deployments -> Click "Promote to Production" en el commit anterior válido. | App web online antigua |
| 2 | Revertir BD | Líder BD | `npx supabase db push` de versión antigua o Restauración PITR. | Datos consultables |

# **13. Operación rutinaria**

## **13.1 Arranque y detención**

Dado el modelo Serverless (Vercel) y de base de datos administrada (Supabase), no existen comandos tradicionales de inicio y apagado para el servidor, ya que la infraestructura es bajo demanda y gestionada automáticamente.

## **13.2 Tareas periódicas**

| Tarea | Frecuencia | Responsable | Procedimiento | Evidencia |
| :---- | :---- | :---- | :---- | :---- |
| Revisión de logs en Vercel | Diaria | DevOps | Acceder a Vercel -> Logs | Ausencia de Errores 500 continuos |
| Revisión de uso BD (Supabase) | Semanal | DB Admin | Supabase -> Reports / Database Health | Espacio en disco y carga de API |
| Renovación de dominios | Anual | Administrador | Panel de DNS | Certificados SSL son auto-renovados por Vercel |

# **14. Logs, monitoreo y observabilidad**

## **14.1 Registro de eventos**

| Fuente | Ubicación | Formato | Nivel | Retención | Datos prohibidos |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Next.js API | Vercel Logs | Texto (Consola) | info, error | Plan Vercel (1 día a 30 días) | Passwords, Tokens |
| BD Postgres | Supabase Logs | JSON / Explorer | Todo | Plan Supabase (7 días a 90 días) | Datos sensibles sin ofuscar |
| Auditoría App | Tabla `audit_logs` | SQL BD | info | Permanente (límite histórico configurable) | N/A |

## **14.2 Métricas y umbrales**

| Métrica | Fuente | Umbral normal | Umbral de alerta | Acción |
| :---- | :---- | :---- | :---- | :---- |
| Uso de BD (Egress/Disco) | Supabase Dashboard | < 80% del límite de plan | 90% | Considerar Upgrade de plan |
| Tiempo de Ejecución API | Vercel Analytics | < 1000ms | > 5000ms (Timeout Edge) | Revisar consultas SQL / RLS |

# **15. Respaldo y recuperación**

## **15.1 Política de respaldo**

Supabase realiza respaldos automatizados diariamente. En planes de pago soporta Point-in-Time Recovery (PITR) permitiendo recuperación al minuto.

| Recurso | Tipo | Frecuencia | Retención | Ubicación | Cifrado | Responsable |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| Base de datos | Backup Físico Automatizado | Diaria | 7 a 30 días | Infraestructura AWS (Supabase) | AES-256 | Supabase |
| Storage (Archivos) | Replicación S3 | Continua | Según el plan | AWS S3 | AES-256 | Supabase |

## **15.3 Procedimiento de restauración**

1. Acceder al dashboard de Supabase de la organización.
2. Navegar a **Database** -> **Backups**.
3. Seleccionar la fecha del respaldo válido o la hora en PITR.
4. Clic en "Restore". (Esto implicará indisponibilidad por minutos).
5. Validar con pruebas de humo.

# **16. Seguridad operativa**

## **16.1 Principios mínimos**

* El API de la base de datos se expone de forma directa al cliente (React) solo utilizando `NEXT_PUBLIC_SUPABASE_ANON_KEY`, obligando a que toda operación pase por Row Level Security (RLS).
* El JWT contiene el ID del usuario. RLS utiliza `auth.uid()` para asegurar que los usuarios solo ven BackRooms o Salas que pertenezcan a su `organization_id`.
* En la carga de archivos, se valida el tamaño del archivo, tipo de MIME y cuotas de límite según el plan (Stripe).
* Las llaves maestras (`SERVICE_ROLE_KEY`) solo se usan en llamadas Server-Side específicas que necesitan evadir el RLS temporalmente (Ej: Webhooks de Stripe, creación inicial de orgs).

## **16.3 Gestión de vulnerabilidades**

| Fuente | Frecuencia | Severidad crítica | Responsable | Tratamiento | Evidencia |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Dependencias | Semanal (`npm audit`) | Alta/Crítica | DevOps / Equipo Dev | Actualización de paquetes menores | Reporte de `npm audit` vacío |

# **17. Mantenimiento y evolución**

## **17.2 Flujo de mantenimiento**

1. Registro de Incidente o Feature (Tablero de Tareas).
2. Creación de rama `feat/nombre-tarea` o `fix/nombre-tarea`.
3. Implementación y `npm run build` local.
4. Pull Request a `dev`.
5. Code Review por otro desarrollador (Verificar impacto de UI y esquemas DB).
6. Merge y eventual despliegue.

# **18. Diagnóstico y solución de problemas**

## **18.2 Catálogo de incidentes frecuentes**

| Código | Síntoma | Causa probable | Diagnóstico | Solución | Escalar cuando |
| :---- | :---- | :---- | :---- | :---- | :---- |
| INC-01 | Error 500 al login (Auth) | Claves de Supabase incorrectas en Vercel | Vercel Logs muestran JWT error | Corregir variables de entorno en Vercel y Redeploy. | Falla de infraestructura Supabase |
| INC-02 | Tabla vacía en Frontend | RLS bloquea lectura (403) | Consultar BD con service_role da datos pero con anon no. | Revisar políticas RLS (Permisos de Sala). | Afecta todas las orgs |
| INC-03 | Error de tipeo en TS Inference | Schema de BD cambió sin actualizar Types | `npm run build` local falla | Correr `npx supabase gen types...` y hacer commit. | N/A |
| INC-04 | Error en pagos/planes | Webhook de Stripe no recibe data | Stripe Dashboard indica Failed | Revisar Endpoint Secret en variables de entorno. | Persiste error 500 |

# **19. Modelo de soporte y escalamiento**

| Nivel | Responsabilidad | Ejemplos | Tiempo objetivo | Escalamiento |
| :---- | :---- | :---- | :---- | :---- |
| Nivel 1 | Recepción y soporte de uso | Usuario no encuentra cómo crear sala | 2 horas | Equipo Dev |
| Nivel 2 | Análisis técnico (Bugs) | Archivo no carga (Error Storage) | 24 horas | DevOps |
| Proveedor externo | Infraestructura Caída | Vercel o Supabase Down | Según SLA | Soporte de Proveedores |

# **20. Continuidad y recuperación ante desastres**

## **20.1 Dependencias críticas**

| Dependencia | Criticidad | Alternativa | Tiempo tolerable | Responsable |
| :---- | :---- | :---- | :---- | :---- |
| Vercel | Crítica | Desplegar en Cloudflare Pages / AWS Amplify | < 1h | DevOps |
| Supabase | Crítica | Exportar Docker Image a VPS propio | < 4h | Líder Técnico |
| Resend | Media | Cambiar a Sendgrid u otro SMTP SMTP | < 24h | Líder Técnico |

# **21. Transferencia técnica y entrega**

## **21.1 Paquete técnico de entrega**

| Elemento | Formato / ubicación | Versión | Verificado | Observaciones |
| :---- | :---- | :---- | :---- | :---- |
| Repositorio y etiqueta | GitHub (`dev` branch) | v0.1.0 | Sí | |
| README | Markdown | 1.0 | Sí | Instrucciones de instalación |
| Manual técnico | Word (.docx) / PDF | 1.0 | Sí | Este documento |
| Migraciones y semillas | SQL scripts | 1.0 | Sí | Carpeta `supabase/` |
| Configuración de ejemplo | `.env.example` | 1.0 | Sí | Sin valores reales |

# **22. Lista de verificación del manual técnico**

| N.° | Verificación | Cumple | Evidencia | Observaciones |
| :---- | :---- | :---- | :---- | :---- |
| 1 | El manual corresponde a la versión entregada. | Sí | Git branch v0.1.0 | MVP de BackRoom |
| 2 | Los requisitos de hardware y software están definidos. | Sí | Sección 4.1 y 4.2 | Serverless + Node |
| 3 | Las versiones de dependencias son identificables. | Sí | Sección 3.1 | `package.json` |
| 4 | La estructura del repositorio está explicada. | Sí | Sección 5 | App Router |
| 5 | Existe archivo de configuración de ejemplo sin secretos. | Sí | Sección 6.1 | `.env.example` real |
| 6 | Las variables de entorno están documentadas. | Sí | Sección 6.1 | Documentadas |
| 7 | La instalación puede ejecutarse en un ambiente limpio. | Sí | Sección 7.2 | NPM install probado |
| 8 | Las migraciones crean el esquema completo. | Sí | Sección 8.2 | Supabase CLI |
| 9 | Los datos semilla no contienen información personal real. | Sí | Sección 8.3 | Seed para admin |
| 10 | Los comandos de pruebas, lint y build están documentados. | Sí | Sección 9.1 | |
| 11 | Los artefactos de entrega son reproducibles. | Sí | Sección 10 | Vercel Builder |
| 12 | Los ambientes están claramente separados. | Sí | Sección 11.1 | Dev / Prev / Prod |
| 13 | El procedimiento de despliegue es verificable. | Sí | Sección 11.2 | Auto-Deploy GH |
| 14 | Existe estrategia de rollback cuando aplica. | Sí | Sección 12.2 | Vercel Rollback |
| 15 | Los logs no exponen secretos ni datos sensibles. | Sí | Sección 14.1 | |

# **23. Registro de revisión y aprobación**

## **23.1 Declaración de conformidad**

Se declara que el presente manual corresponde a la versión indicada del producto, que los procedimientos principales han sido revisados y que no se incluyen credenciales reales ni datos sensibles.

| Nombre | Rol | Firma / aceptación | Fecha |
| :---- | :---- | :---- | :---- |
| [Rellenar] | Líder Proyecto | | |
| [Rellenar] | DevOps / Dev | | |
| [Rellenar] | Docente / Tutor| | |
