# Reporte de Calidad del Código — BackRoom

**Fecha:** 18 de agosto de 2026
**Alcance:** Auditoría completa del código fuente (módulos core + invitaciones recién integradas)

---

## CRÍTICO (P0) — Rompen funcionalidad core

### 1. RLS bloquea usuarios no logueados en invitaciones
- **Archivo:** `lib/services/invitations.service.ts:136-142` + `supabase/migrations/20260817000001_organization_invitations.sql:31-35`
- **Problema:** `getInvitationByToken` usa `createClient()` (user-scoped). La política SELECT de `organization_invitations` solo permite `is_org_owner()` o `is_org_member()`. Un usuario no logueado — el caso de uso principal del link de invitación — siempre recibe "Enlace no válido".
- **Fix:** Usar `createAdminClient()` en `getInvitationByToken` o agregar política RLS que permita SELECT por email coincidente.

### 2. GET /invitations sin autorización
- **Archivo:** `app/api/organizations/[orgId]/invitations/route.ts:25-43`
- **Problema:** Cualquier usuario autenticado puede listar invitaciones de cualquier organización solo con saber el UUID. Expone emails y tokens de invitación. El propio desarrollador lo documentó en comentarios.
- **Fix:** Verificar que el usuario es owner o admin antes de listar.

### 3. Operación acceptInvitation no atómica
- **Archivo:** `lib/services/invitations.service.ts:175-199`
- **Problema:** Paso 1 marca la invitación como "accepted". Paso 2 inserta en `organization_members`. Si el paso 2 falla (error distinto a `23505`), la invitación queda en estado "accepted" sin registro de miembro.
- **Fix:** Revertir orden: insertar miembro primero, marcar invitación después. O usar RPC/transacción.

---

## ALTO (P1) — Seguridad y datos

### 4. listMembers() sin auth check
- **Archivo:** `lib/services/organizations.service.ts:316`
- **Problema:** Cualquier usuario autenticado puede listar miembros de cualquier organización. Expone usernames, nombres completos y emails.
- **Fix:** Verificar membresía/ownership antes de retornar datos.

### 5. Eliminación de organización no atómica
- **Archivo:** `lib/services/organizations.service.ts:300-309`
- **Problema:** Borra backrooms en loop secuencial sin transacción. Si uno falla, la org se borra igual, dejando audit_logs y referencias huérfanas.
- **Fix:** Usar transacción o ON DELETE CASCADE en las foreign keys.

### 6. Non-null assertion peligrosa en landing
- **Archivo:** `app/invitaciones/[token]/page.tsx:64`
- **Problema:** `sessionData.session!.user.id` crashea si la sesión expira entre el check inicial y el submit del formulario.
- **Fix:** Agregar null check antes del assertion.

### 7. rbac.ts: as any + columna dinámica
- **Archivo:** `lib/auth/rbac.ts:77,82`
- **Problema:** Usa un string del usuario como nombre de columna en Supabase (`.select(permisoRequerido)`) y lo castea a `any` para acceder al resultado. Riesgo de inyección a nivel de consulta si el valor no está validado.
- **Fix:** Usar mapeo estático tipo-safe de permisos a columnas.

### 8. Dos createAdminClient() duplicados
- **Archivo:** `lib/supabase/server.ts:23` vs `lib/supabase/admin.ts:3`
- **Problema:** Dos implementaciones con configuraciones diferentes. `organizations.service.ts` importa de `server.ts`, `rbac.ts` importa de `admin.ts`.
- **Fix:** Unificar en una sola implementación.

### 9. Rate limiter: memory leak + ineficaz en serverless
- **Archivo:** `lib/auth/rate-limit.ts:10`
- **Problema:** El Map nunca limpia entries expiradas (memory leak). En serverless/Vercel cada invocación tiene Map nuevo (rate limiting ineficaz).
- **Fix:** Agregar limpieza periódica o migrar a Redis/Upstash.

---

## MEDIO (P2) — Calidad y mantenibilidad

### 10. Uso extensivo de `any`
- **Archivos:** `invite-member-modal.tsx:37`, `invitaciones/[token]/page.tsx:8,13,65`, `miembros/page.tsx:18`
- **Problema:** `catch (err: any)` y `let invitation: any` en múltiples archivos del módulo de invitaciones.
- **Fix:** Tipar correctamente con `Error` o interfaces específicas.

### 11. Error messages filtrados en URL
- **Archivo:** `app/invitaciones/[token]/page.tsx:60-68`
- **Problema:** El Server Action redirige con `?error=${encodeURIComponent(e.message)}`, exponiendo mensajes internos del servidor.
- **Fix:** Usar códigos de error genéricos en vez de mensajes textuales.

### 12. Código duplicado de permisos
- **Archivo:** `lib/services/invitations.service.ts:22-48` vs `210-237`
- **Problema:** Bloque de verificación de permisos (owner o admin) repetido idénticamente.
- **Fix:** Extraer a método privado estático.

### 13. listPendingInvitations sin auth
- **Archivo:** `lib/services/invitations.service.ts:250-263`
- **Problema:** No verifica si el caller tiene acceso a la organización.
- **Fix:** Agregar parámetro `authId` y verificar membresía.

### 14. Audit log usa user-scoped client
- **Archivo:** `lib/audit.ts:1`
- **Problema:** `logAudit` importa `createClient()` (user-scoped). Podría fallar bajo RLS si no hay INSERT policy para usuarios regulares.
- **Fix:** Usar `createAdminClient()` para inserts de auditoría.

### 15. Retorno silencioso en form vacío
- **Archivo:** `app/dashboard/configuracion/configuracion-form.tsx:47`
- **Problema:** Si el nombre está vacío, `handleSave` retorna sin mostrar feedback al usuario.
- **Fix:** `setError("El nombre no puede estar vacío")`.

### 16. Botones de acción en filas pending
- **Archivo:** `app/dashboard/miembros/miembros-table.tsx:232-290`
- **Problema:** "Hacer Admin" / "Remover" se muestran en filas de invitaciones pendientes (userId: `invite-<uuid>`), causando errores API.
- **Fix:** Filtrar filas pending de acciones de miembro, agregar acciones de invitación (revocar).

### 17. Schemas de invitación descentralizados
- **Archivo:** `lib/validations/schemas.ts`
- **Problema:** `createInvitationSchema` vive en `invitations.service.ts`, rompiendo la convención del proyecto.
- **Fix:** Mover a `lib/validations/schemas.ts` y agregar schemas faltantes.

---

## BAJO (P3) — Estilo y optimización

### 18. Arbitrary Tailwind values
- **Archivos:** Todos los archivos UI
- **Problema:** Uso masivo de `text-[#e2e2e2]`, `text-[12px]`, `border-[#3f3f46]` en vez de design tokens. Difícil de mantener y tematizar.
- **Sugerencia:** Crear variables CSS o usar theme() de Tailwind.

### 19. Email hardcoded
- **Archivo:** `lib/services/invitations.service.ts:113`
- **Problema:** `from: "BackRoom <onboarding@resend.dev>"` con TODO pendiente.
- **Fix:** `process.env.RESEND_FROM_EMAIL || "BackRoom <onboarding@resend.dev>"`.

### 20. Expiración hardcoded
- **Archivo:** `lib/services/invitations.service.ts:86`
- **Problema:** 7 días hardcoded. Debería ser configurable.

### 21. Rate limit pendiente de Redis
- **Archivo:** `lib/auth/rate-limit.ts:3`
- **TODO:** "reemplazar por solucion persistente (Redis/Upstash) en produccion".

### 22. Lógica de permisos confusa
- **Archivo:** `lib/auth/rbac.ts:86-106`
- **Problema:** `contribuir` bypass todos los permisos granulares de sala, derribando el sistema de matriz de permisos.

---

## Resumen por Archivo

| Archivo | Issues | Más grave |
|---------|--------|-----------|
| `lib/services/invitations.service.ts` | 6 | No atómica + sin auth en listPending |
| `lib/auth/rbac.ts` | 5 | `as any` + columna dinámica |
| `lib/services/organizations.service.ts` | 5 | Eliminación no atómica + listMembers sin auth |
| `app/invitaciones/[token]/page.tsx` | 4 | RLS bloquea usuarios + non-null assertion |
| `lib/auth/rate-limit.ts` | 3 | Memory leak + ineficaz en serverless |
| `lib/supabase/server.ts` | 2 | Admin client duplicado |
| `app/dashboard/miembros/miembros-table.tsx` | 1 | Botones de acción en filas pending |
| `app/dashboard/configuracion/configuracion-form.tsx` | 2 | Retorno silencioso + img src sin validar |
| `lib/audit.ts` | 2 | User-scoped client para inserts |
| `lib/validations/schemas.ts` | 1 | Schemas de invitación faltantes |

---

## Estadísticas

- **P0 (Crítico):** 3 issues
- **P1 (Alto):** 6 issues
- **P2 (Medio):** 8 issues
- **P3 (Bajo):** 5 issues
- **Total:** 22 issues identificados
