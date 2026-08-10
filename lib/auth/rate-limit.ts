// lib/auth/rate-limit.ts
// Utilidad de rate limiting en memoria para endpoints de autenticación (BE-68)
// TODO: reemplazar por solución persistente (Redis/Upstash) en producción

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const requestMap = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60_000; // 1 minuto
const MAX_REQUESTS = 10;  // máximo de peticiones por ventana

export interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number; // segundos hasta poder reintentar
}

export function checkRateLimit(identifier: string): RateLimitResult {
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

/** Helper: responde con 429 si el rate limit fue superado */
export function rateLimitResponse(retryAfter: number) {
  return Response.json(
    {
      error: {
        code: "RATE_LIMIT",
        message: "Demasiados intentos. Inténtalo más tarde.",
        details: { retryAfter },
      },
    },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfter) },
    }
  );
}
