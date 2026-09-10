import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { checkRateLimit, rateLimitResponse } from "@/lib/auth/rate-limit";

export async function middleware(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "anon";
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/")) {
    const rl = checkRateLimit(`global:${ip}`, 100);
    if (!rl.allowed) {
      return rateLimitResponse(rl.retryAfter!);
    }
  }

  // WORKAROUND: Edge runtime fetch is hanging due to broken IPv6 routing from the ISP.
  // We bypass `updateSession` entirely so the app doesn't hang for 120s.
  // Auth checks will rely on client/server components until the network stabilizes.
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
