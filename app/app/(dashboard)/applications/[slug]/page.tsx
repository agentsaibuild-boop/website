import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getApplication, getPriceId } from "@/lib/applications";
import { PlansClient } from "./PlansClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ApplicationPlansPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const app = getApplication(slug);
  if (!app || !app.available) notFound();

  // Resolve Stripe price IDs server-side (env vars not available client-side)
  const resolvedPriceIds = Object.fromEntries(
    app.plans.map((p) => [p.priceEnvKey, getPriceId(p.priceEnvKey)])
  );

  const subscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
    select: {
      stripePriceId: true,
      status: true,
      currentPeriodEnd: true,
      cancelAtPeriodEnd: true,
    },
  });

  return (
    <PlansClient
      app={app}
      resolvedPriceIds={resolvedPriceIds}
      currentPriceId={subscription?.stripePriceId ?? null}
      isActive={subscription?.status === "ACTIVE"}
      cancelAtPeriodEnd={subscription?.cancelAtPeriodEnd ?? false}
      periodEnd={subscription?.currentPeriodEnd?.toISOString() ?? null}
    />
  );
}
