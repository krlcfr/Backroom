# BackRoom

Plataforma web colaborativa de estudio y organización del conocimiento. Crea espacios (BackRooms), organiza salas temáticas, comparte recursos académicos y controla permisos de acceso.

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| Lenguaje | TypeScript 5 |
| Base de datos | Supabase PostgreSQL |
| Autenticación | Supabase Auth + `@supabase/ssr` |
| Almacenamiento | Supabase Storage |
| Despliegue | Railway o Render |

## Requisitos

- Node.js 20+
- npm
- Cuenta en Supabase (plan gratuito)

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

4. Completar las variables en `.env.local` con los valores de tu proyecto Supabase.

5. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

6. Abrir [http://localhost:3000](http://localhost:3000).

## Seed del SuperAdmin

```bash
npm run seed
```

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm start` | Iniciar servidor de producción |
| `npm run lint` | Ejecutar ESLint |

## Estructura del proyecto

```
app/
├── api/           # Route Handlers (API REST)
├── (auth)/        # Login, registro, recuperar contraseña
├── dashboard/     # Dashboard principal
├── backrooms/     # BackRooms, salas, recursos
├── admin/         # Panel SuperAdmin
├── _components/   # Componentes reutilizables
└── _lib/          # Lógica compartida (Supabase client, utils)
```

## Despliegue

El proyecto está configurado para desplegarse en Railway o Render como Node.js standalone (no Vercel, debido a límites de tamaño de archivos en el plan gratuito).

## Documentación

La documentación completa del proyecto (análisis, diseño, decisiones técnicas) se encuentra en el repositorio de documentación.

## Licencia

Uso educativo — Proyecto de grado.
