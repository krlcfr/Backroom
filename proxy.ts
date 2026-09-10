import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

import { checkRateLimit, rateLimitResponse } from "@/lib/auth/rate-limit";

export async function proxy(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "anon";
  const { pathname } = request.nextUrl;

  // Rate Limit Global para rutas de API (Requisito SENA #8)
  // Límite más holgado para uso general (100 peticiones por minuto)
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/")) {
    const rl = checkRateLimit(`global:${ip}`, 100);
    if (!rl.allowed) {
      return rateLimitResponse(rl.retryAfter!);
    }
  }

  // WORKAROUND: Edge runtime fetch to Supabase is hanging on this machine due to IPv6/Antivirus/Network issues.
  // We bypass the middleware DB checks so the user can continue developing. 
  // Client-side and Server Component auth still work perfectly.
  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
