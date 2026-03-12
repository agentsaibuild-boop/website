import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { PLANS } from "@/lib/stripe";
import Link from "next/link";

export default async function PricingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const subscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
    select: { plan: true, status: true, currentPeriodEnd: true, cancelAtPeriodEnd: true },
  });

  const currentPlan = subscription?.plan ?? null;
  const isActive = subscription?.status === "ACTIVE";

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Планове и цени</h1>
        <p className="page-subtitle">Изберете план, подходящ за вашия бизнес</p>
      </div>

      {subscription?.cancelAtPeriodEnd && subscription.currentPeriodEnd && (
        <div className="banner banner-warning" style={{ maxWidth: 680 }}>
          <p>
            Абонаментът ви е планиран за отмяна на{" "}
            <strong>{new Date(subscription.currentPeriodEnd).toLocaleDateString("bg-BG")}</strong>.
            Можете да го подновите по всяко време.
          </p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", maxWidth: 680 }}>
        {(Object.entries(PLANS) as [keyof typeof PLANS, typeof PLANS[keyof typeof PLANS]][]).map(
          ([key, plan]) => {
            const isCurrent = currentPlan === key && isActive;
            return (
              <div
                key={key}
                className="section-card"
                style={{
                  border: isCurrent
                    ? "1px solid var(--color-accent-light)"
                    : "1px solid var(--color-border)",
                  position: "relative",
                }}
              >
                {isCurrent && (
                  <div
                    style={{
                      position: "absolute",
                      top: -1,
                      right: 16,
                      background: "var(--color-accent)",
                      color: "#fff",
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      padding: "0.2rem 0.75rem",
                      borderRadius: "0 0 var(--radius-sm) var(--radius-sm)",
                    }}
                  >
                    ТЕКУЩ ПЛАН
                  </div>
                )}
                <div style={{ padding: "1.75rem 1.5rem 1.5rem" }}>
                  <h2 style={{ fontSize: "1.125rem", fontWeight: 700, margin: "0 0 0.25rem" }}>
                    {plan.name}
                  </h2>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <span style={{ fontSize: "2rem", fontWeight: 800 }}>{plan.price}</span>
                    <span style={{ fontSize: "0.875rem", color: "var(--color-muted)", marginLeft: "0.25rem" }}>
                      {plan.currency} / месец
                    </span>
                  </div>

                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      margin: "0 0 1.75rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.625rem",
                    }}
                  >
                    {plan.features.map((f) => (
                      <li key={f} style={{ fontSize: "0.875rem", display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                        <span style={{ color: "var(--color-accent-light)", flexShrink: 0, marginTop: 1 }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <button disabled className="btn-primary" style={{ opacity: 0.5 }}>
                      Активен
                    </button>
                  ) : (
                    <form action="/api/stripe/checkout" method="POST">
                      <input type="hidden" name="plan" value={key} />
                      <button type="submit" className="btn-primary">
                        {isActive ? "Смени план" : "Абонирай се"}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            );
          }
        )}
      </div>

      {isActive && !subscription?.cancelAtPeriodEnd && (
        <div style={{ marginTop: "0.5rem" }}>
          <Link href="/api/stripe/portal" className="btn-ghost-sm">
            Управление на абонамента →
          </Link>
        </div>
      )}
    </div>
  );
}
