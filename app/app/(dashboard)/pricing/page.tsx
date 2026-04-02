import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { PricingClient } from "./PricingClient";

export default async function PricingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const subscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
    select: { plan: true, status: true, currentPeriodEnd: true, cancelAtPeriodEnd: true },
  });

  return (
    <PricingClient
      currentPlan={subscription?.plan ?? null}
      isActive={subscription?.status === "ACTIVE"}
      cancelAtPeriodEnd={subscription?.cancelAtPeriodEnd ?? false}
      periodEnd={subscription?.currentPeriodEnd?.toISOString() ?? null}
    />
  );
}
