import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("Stripe-Signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature provided" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret missing" }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const adminSupabase = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.subscription) {
          const organizationId = session.metadata?.organizationId;
          if (!organizationId) break;

          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          await updateOrganizationSubscription(adminSupabase, organizationId, subscription);
        }
        break;
      }
      
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await updateOrganizationSubscriptionByStripeId(adminSupabase, subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await updateOrganizationSubscriptionByStripeId(adminSupabase, subscription);
        break;
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error(`Error processing webhook: ${error.message}`);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

// Helpers

async function updateOrganizationSubscription(supabase: any, orgId: string, subscription: Stripe.Subscription) {
  const priceId = subscription.items.data[0].price.id;
  const { plan, cycle } = mapPriceToPlan(priceId);

  await supabase
    .from("organizations")
    .update({
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      plan: plan,
      billing_cycle: cycle,
      cancel_at_period_end: subscription.cancel_at_period_end,
    })
    .eq("id", orgId);
}

async function updateOrganizationSubscriptionByStripeId(supabase: any, subscription: Stripe.Subscription) {
  const priceId = subscription.items.data[0].price.id;
  const { plan, cycle } = mapPriceToPlan(priceId);

  await supabase
    .from("organizations")
    .update({
      subscription_status: subscription.status,
      plan: subscription.status === "active" ? plan : "free",
      billing_cycle: cycle,
      cancel_at_period_end: subscription.cancel_at_period_end,
    })
    .eq("stripe_subscription_id", subscription.id);
}

function mapPriceToPlan(priceId: string): { plan: "free" | "pro" | "enterprise", cycle: "monthly" | "annual" | null } {
  const env = process.env;
  if (priceId === env.STRIPE_PRICE_PRO_MONTHLY) return { plan: "pro", cycle: "monthly" };
  if (priceId === env.STRIPE_PRICE_PRO_ANNUAL) return { plan: "pro", cycle: "annual" };
  if (priceId === env.STRIPE_PRICE_ENTERPRISE_MONTHLY) return { plan: "enterprise", cycle: "monthly" };
  if (priceId === env.STRIPE_PRICE_ENTERPRISE_ANNUAL) return { plan: "enterprise", cycle: "annual" };
  
  return { plan: "free", cycle: null };
}
