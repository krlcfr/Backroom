// lib/auth/rate-limit.ts
// Utilidad de rate limiting en memoria para endpoints de autenticación (BE-68)
// TODO: reemplazar por solución persistente (Redis/Upstash) en producción

const requestMap = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60_000; // 1 minuto
const MAX_REQUESTS = 10;  // máximo de peticiones por ventana

export function checkRateLimit(identifier: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = requestMap.get(identifier);

  if (!entry || now > entry.resetAt) {
    requestMap.set(identifier, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= MAX_REQUESTS) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count++;
  return { allowed: true };
}
