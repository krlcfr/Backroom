import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { handleApiError, ApiError } from "@/lib/api-error";
import { stripe } from "@/lib/stripe";
import { z } from "zod";

const portalSchema = z.object({
  organizationId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { organizationId } = portalSchema.parse(body);

    const supabase = await createClient();

    // Get the internal user profile to check ownership
    const { getUsuarioInterno } = await import("@/lib/auth/rbac");
    const internalUser = await getUsuarioInterno(user.id);
    if (!internalUser) {
      throw new ApiError(404, "Perfil de usuario no encontrado");
    }

    // Verify user is owner of the organization
    const { data: org } = await supabase
      .from("organizations")
      .select("id, owner_id, stripe_customer_id")
      .eq("id", organizationId)
      .single();

    if (!org) {
      throw new ApiError(404, "Organización no encontrada");
    }

    if (org.owner_id !== internalUser.id) {
      throw new ApiError(403, "Solo el propietario puede gestionar los planes de pago");
    }

    if (!org.stripe_customer_id) {
      throw new ApiError(400, "Esta organización no tiene información de facturación");
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // Create Stripe Customer Portal Session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: org.stripe_customer_id,
      return_url: `${siteUrl}/dashboard/configuracion/planes`,
    });

    return NextResponse.json({ url: portalSession.url }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
