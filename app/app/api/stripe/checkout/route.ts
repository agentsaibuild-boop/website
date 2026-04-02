import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { getPriceId } from "@/lib/applications";
import { z } from "zod";

const checkoutSchema = z.object({
  priceEnvKey: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Неоторизиран достъп" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Невалидна заявка" }, { status: 400 });
  }

  const priceId = getPriceId(parsed.data.priceEnvKey);
  if (!priceId) {
    return NextResponse.json({ error: "Ценовият план не е конфигуриран." }, { status: 400 });
  }

  // Get or create Stripe customer
  let stripeCustomerId: string;
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true, email: true, name: true },
  });

  if (user?.stripeCustomerId) {
    stripeCustomerId = user.stripeCustomerId;
  } else {
    const customer = await stripe.customers.create({
      email: session.user.email,
      name: user?.name ?? undefined,
      metadata: { userId: session.user.id },
    });
    stripeCustomerId = customer.id;
    await db.user.update({
      where: { id: session.user.id },
      data: { stripeCustomerId },
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3001";

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard?payment=success`,
    cancel_url: `${appUrl}/applications?payment=canceled`,
    metadata: { userId: session.user.id },
    subscription_data: {
      metadata: { userId: session.user.id },
    },
    locale: "bg",
  });

  return NextResponse.json({ url: checkoutSession.url });
}
