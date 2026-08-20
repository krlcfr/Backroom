import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { handleApiError, ApiError } from "@/lib/api-error";
import { stripe } from "@/lib/stripe";
import { z } from "zod";

const checkoutSchema = z.object({
  organizationId: z.string().uuid(),
  priceId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { organizationId, priceId } = checkoutSchema.parse(body);

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
      .select("id, name, owner_id, stripe_customer_id")
      .eq("id", organizationId)
      .single();

    if (!org) {
      throw new ApiError(404, "Organización no encontrada");
    }

    if (org.owner_id !== internalUser.id) {
      throw new ApiError(403, "Solo el propietario puede gestionar los planes de pago");
    }

    // Create or retrieve Stripe customer
    let customerId = org.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        name: org.name,
        metadata: {
          organizationId: org.id,
          ownerId: user.id,
        },
      });
      customerId = customer.id;

      // Save customer ID in Supabase using admin client because of RLS updates
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const adminClient = createAdminClient();
      await adminClient
        .from("organizations")
        .update({ stripe_customer_id: customerId })
        .eq("id", org.id);
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // Map frontend keys to real Stripe Price IDs from ENV
    let realPriceId = priceId;
    if (priceId === "price_pro_monthly") realPriceId = process.env.STRIPE_PRICE_PRO_MONTHLY!;
    else if (priceId === "price_pro_annual") realPriceId = process.env.STRIPE_PRICE_PRO_ANNUAL!;
    else if (priceId === "price_ent_monthly") realPriceId = process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY!;
    else if (priceId === "price_ent_annual") realPriceId = process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL!;

    if (!realPriceId) {
      throw new ApiError(400, "ID de precio no válido o no configurado");
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: realPriceId,
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/dashboard/organizaciones/${org.id}/planes?success=true`,
      cancel_url: `${siteUrl}/dashboard/organizaciones/${org.id}/planes?canceled=true`,
      metadata: {
        organizationId: org.id,
      },
    });

    if (!session.url) {
      throw new ApiError(500, "Error al crear la sesión de pago");
    }

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
