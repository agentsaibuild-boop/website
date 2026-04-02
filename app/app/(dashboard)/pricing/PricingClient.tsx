"use client";

import { useState } from "react";
import Link from "next/link";
import { PLANS } from "@/lib/stripe";

interface Props {
  currentPlan: string | null;
  isActive: boolean;
  cancelAtPeriodEnd: boolean;
  periodEnd: string | null;
}

export function PricingClient({ currentPlan, isActive, cancelAtPeriodEnd, periodEnd }: Props) {
  const [loading, setLoading] = useState<string | null>(null);

  async function subscribe(plan: string) {
    setLoading(plan);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    setLoading(null);
    if (data.url) {
      window.location.href = data.url;
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Планове и цени</h1>
        <p className="page-subtitle">Изберете план, подходящ за вашия бизнес</p>
      </div>

      {cancelAtPeriodEnd && periodEnd && (
        <div className="banner banner-warning" style={{ maxWidth: 680 }}>
          <p>
            Абонаментът е планиран за отмяна на{" "}
            <strong>{new Date(periodEnd).toLocaleDateString("bg-BG")}</strong>.
          </p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", maxWidth: 680 }}>
        {(Object.entries(PLANS) as [keyof typeof PLANS, (typeof PLANS)[keyof typeof PLANS]][]).map(([key, plan]) => {
          const isCurrent = currentPlan === key && isActive;
          return (
            <div
              key={key}
              className="section-card"
              style={{
                border: isCurrent ? "1px solid var(--color-accent-light)" : "1px solid var(--color-border)",
                position: "relative",
              }}
            >
              {isCurrent && (
                <div style={{
                  position: "absolute", top: -1, right: 16,
                  background: "var(--color-accent)", color: "#fff",
                  fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.08em",
                  padding: "0.2rem 0.75rem",
                  borderRadius: "0 0 var(--radius-sm) var(--radius-sm)",
                }}>
                  ТЕКУЩ ПЛАН
                </div>
              )}
              <div style={{ padding: "1.75rem 1.5rem 1.5rem" }}>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 700, margin: "0 0 0.25rem" }}>{plan.name}</h2>
                <div style={{ marginBottom: "1.5rem" }}>
                  <span style={{ fontSize: "2rem", fontWeight: 800 }}>{plan.price}</span>
                  <span style={{ fontSize: "0.875rem", color: "var(--color-muted)", marginLeft: "0.25rem" }}>
                    {plan.currency} / месец
                  </span>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.75rem", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ fontSize: "0.875rem", display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                      <span style={{ color: "var(--color-accent-light)", flexShrink: 0, marginTop: 1 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <button disabled className="btn-primary" style={{ opacity: 0.5 }}>Активен</button>
                ) : (
                  <button
                    className="btn-primary"
                    onClick={() => subscribe(key)}
                    disabled={loading === key}
                  >
                    {loading === key ? "Зарежда…" : isActive ? "Смени план" : "Абонирай се"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isActive && !cancelAtPeriodEnd && (
        <div style={{ marginTop: "0.5rem" }}>
          <Link href="/api/stripe/portal" className="btn-ghost-sm">
            Управление на абонамента →
          </Link>
        </div>
      )}
    </div>
  );
}
