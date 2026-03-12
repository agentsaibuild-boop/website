import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import type Stripe from "stripe";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
  } catch (err) {
    console.error("[stripe-webhook] Invalid signature:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(sub);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(sub);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }
    }
  } catch (err) {
    console.error("[stripe-webhook] Handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  if (!userId) return;

  const stripeCustomerId = session.customer as string;
  const stripeSubscriptionId = session.subscription as string;

  // Get subscription details from Stripe
  const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
  const priceId = sub.items.data[0]?.price.id;
  const productId = sub.items.data[0]?.price.product as string;

  // Activate user account and subscription
  await db.$transaction([
    db.user.update({
      where: { id: userId },
      data: {
        accountStatus: "ACTIVE",
        stripeCustomerId,
      },
    }),
    db.subscription.upsert({
      where: { userId },
      create: {
        userId,
        stripeSubscriptionId,
        stripePriceId: priceId,
        stripeProductId: productId,
        status: "ACTIVE",
        currentPeriodStart: new Date(sub.current_period_start * 1000),
        currentPeriodEnd: new Date(sub.current_period_end * 1000),
      },
      update: {
        stripeSubscriptionId,
        stripePriceId: priceId,
        stripeProductId: productId,
        status: "ACTIVE",
        currentPeriodStart: new Date(sub.current_period_start * 1000),
        currentPeriodEnd: new Date(sub.current_period_end * 1000),
      },
    }),
    db.auditLog.create({
      data: {
        userId,
        action: "SUBSCRIPTION_ACTIVATED",
        entity: "Subscription",
        metadata: { stripeSubscriptionId, priceId },
      },
    }),
  ]);
}

async function handleSubscriptionUpdated(sub: Stripe.Subscription) {
  const subscription = await db.subscription.findUnique({
    where: { stripeSubscriptionId: sub.id },
  });
  if (!subscription) return;

  const status =
    sub.status === "active"
      ? "ACTIVE"
      : sub.status === "past_due"
        ? "PAST_DUE"
        : sub.status === "trialing"
          ? "TRIALING"
          : "INACTIVE";

  await db.subscription.update({
    where: { stripeSubscriptionId: sub.id },
    data: {
      status,
      currentPeriodStart: new Date(sub.current_period_start * 1000),
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
  });
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  const subscription = await db.subscription.findUnique({
    where: { stripeSubscriptionId: sub.id },
    include: { user: true },
  });
  if (!subscription) return;

  await db.$transaction([
    db.subscription.update({
      where: { stripeSubscriptionId: sub.id },
      data: { status: "CANCELED" },
    }),
    db.user.update({
      where: { id: subscription.userId },
      data: { accountStatus: "EXPIRED" },
    }),
    db.auditLog.create({
      data: {
        userId: subscription.userId,
        action: "SUBSCRIPTION_CANCELED",
        entity: "Subscription",
        metadata: { stripeSubscriptionId: sub.id },
      },
    }),
  ]);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const stripeCustomerId = invoice.customer as string;
  const user = await db.user.findUnique({ where: { stripeCustomerId } });
  if (!user) return;

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "PAYMENT_FAILED",
      entity: "Subscription",
      metadata: { invoiceId: invoice.id },
    },
  });
}
