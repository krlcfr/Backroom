# BackRoom - Plataforma Organizacional

**Estado del Proyecto:** Versión Final v9.3.0 (Aprobado)
**Enlace de Despliegue:** [BackRoom en Vercel](https://backroom.vercel.app)
**Organización:** SENA - CTMA - ADSO Ficha 3114227

---

## 1. Problema y Solución

* **Problema:** Gestión descentralizada, carencia de estructura jerárquica con permisos granulares y falta de flujos de aprobación seguros con firmas digitales (PKI) en organizaciones.
* **Solución:** Plataforma web (BackRoom) que centraliza recursos, implementa un motor de flujos de trabajo (Workflows) con arrastrar y soltar (React Flow), firmas criptográficas inmutables (node-forge/pdf-lib), y control de acceso basado en roles (RBAC).

---

## 2. Características

* **Jerarquía Organizacional:** Estructura de "BackRooms" y "Salas" infinitas y recursivas.
* **Gestor Documental:** Visores inmersivos para PDF, Office, imágenes, video y enlaces.
* **Control de Acceso RBAC:** Políticas granulares y RLS en base de datos.
* **Workflows y Firmas (Acta 72):** Motor de ejecución, diagramación visual, y firmas PKI inmutables generadas en el servidor.
* **Pasarela de Pagos:** Integración con Stripe (Modo de prueba) manejando webhooks y límites de almacenamiento.
* **Auditoría:** Registro de eventos del sistema e histórico de aprobaciones.

---

## 3. Tecnologías

* **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4, React Flow (@xyflow/react).
* **Backend:** Server Actions, API Routes, pdf-lib, node-forge, Zod.
* **Base de Datos:** Supabase (PostgreSQL 15+ con RLS).
* **Pagos:** Stripe SDK Node.js.
* **Despliegue:** Vercel Edge Network.

---

## 4. Requisitos Previos

* Node.js v20+ y npm.
* Cuenta en [Supabase](https://supabase.com).
* Cuenta en [Stripe](https://stripe.com) (Test Mode).
* Claves de Google reCAPTCHA v2.

---

## 5. Instalación

Clonar el repositorio e instalar dependencias:
`ash
git clone <repo-url>
cd backroom
npm install
`

---

## 6. Configuración

1. Duplicar el archivo .env.example y renombrarlo a .env.local.
2. Llenar las variables de Supabase (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY).
3. Llenar las variables de Stripe y reCAPTCHA.
*Asegúrese de no incluir variables reales de producción.*

---

## 7. Migraciones y Semillas

Para preparar la base de datos desde cero, ejecute en el panel SQL de Supabase los archivos ubicados en /supabase/migrations en orden cronológico.
Para inyectar el primer administrador:
`ash
npm run seed:superadmin
`

---

## 8. Ejecución

* **Desarrollo:** 
pm run dev (Disponible en http://localhost:3000)
* **Producción (Build Local):** 
pm run build y luego 
pm start.

---

## 9. Pruebas

El repositorio incluye soporte para pruebas automatizadas utilizando Vitest.
`ash
npm run test
`

---

## 10. Despliegue

La infraestructura ha sido migrada a **Vercel** (Ver ADR-002 en /docs/adr).
El despliegue es automático (CI/CD) al realizar un merge hacia la rama main.

---

## 11. Estructura

* /app: Código fuente principal (App Router, API Webhooks).
* /components: Interfaz de usuario (UI), modales y lienzos React Flow.
* /lib: Lógica de negocio (Supabase, criptografía PKI con node-forge).
* /docs: Documentación viva (ADRs, arquitectura, diccionario de datos).
* /supabase/migrations: Evolución del esquema de base de datos.
* /public: Recursos estáticos no confidenciales.

---

## 12. Autores y Contribuciones

* **Santiago Pinzón:** Líder Técnico, Arquitectura Vercel, Workflows, Infraestructura PKI.
* **Cristian Giraldo:** Responsable de Calidad (QA), Base de Datos, Frontend UI, Documentación Funcional.

---

## 13. Licencia

Privada / Uso Académico SENA (Proyecto de Grado - ADSO Ficha 3114227).
Incluye atribuciones de copyright para React, Next.js, Supabase, Stripe y librerías de terceros (MIT / BSD).
