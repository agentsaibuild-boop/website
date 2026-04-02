"use client";

import { useState } from "react";
import Link from "next/link";
import type { Application } from "@/lib/applications";

interface Props {
  app: Application;
  resolvedPriceIds: Record<string, string>;
  currentPriceId: string | null;
  isActive: boolean;
  cancelAtPeriodEnd: boolean;
  periodEnd: string | null;
}

export function PlansClient({ app, resolvedPriceIds, currentPriceId, isActive, cancelAtPeriodEnd, periodEnd }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function subscribe(priceEnvKey: string) {
    setLoading(priceEnvKey);
    setError(null);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceEnvKey }),
    });
    const data = await res.json();
    setLoading(null);
    if (data.url) {
      window.location.href = data.url;
    } else {
      setError(data.error ?? "Грешка при зареждане на плащане.");
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div style={{ marginBottom: "0.5rem" }}>
          <Link href="/applications" style={{ color: "var(--color-muted)", fontSize: "0.875rem", textDecoration: "none" }}>
            ← Всички приложения
          </Link>
        </div>
        <h1 style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <span>{app.icon}</span>
          {app.name}
        </h1>
        <p className="page-subtitle">{app.description}</p>
      </div>

      {error && (
        <div className="banner banner-error" style={{ maxWidth: 860, marginBottom: "1rem" }}>
          <p>{error}</p>
        </div>
      )}

      {cancelAtPeriodEnd && periodEnd && (
        <div className="banner banner-warning" style={{ maxWidth: 860, marginBottom: "1rem" }}>
          <p>
            Абонаментът е планиран за отмяна на{" "}
            <strong>{new Date(periodEnd).toLocaleDateString("bg-BG")}</strong>.
          </p>
        </div>
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fit, minmax(240px, 1fr))`,
        gap: "1.25rem",
        maxWidth: app.plans.length === 1 ? 280 : app.plans.length === 2 ? 560 : app.plans.length === 3 ? 800 : "100%",
      }}>
        {app.plans.map((plan) => {
          const resolvedPriceId = resolvedPriceIds[plan.priceEnvKey] ?? "";
          const isCurrent = isActive && !!resolvedPriceId && resolvedPriceId === currentPriceId;

          return (
            <div
              key={plan.key}
              className="section-card"
              style={{
                border: isCurrent
                  ? "1px solid var(--color-accent)"
                  : plan.recommended
                  ? "1px solid var(--color-accent-light)"
                  : "1px solid var(--color-border)",
                position: "relative",
              }}
            >
              {isCurrent && (
                <div style={{
                  position: "absolute", top: -1, right: 16,
                  background: "var(--color-accent)", color: "#fff",
                  fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.08em",
                  padding: "0.2rem 0.75rem",
                  borderRadius: "0 0 var(--radius-sm) var(--radius-sm)",
                }}>
                  ТЕКУЩ ПЛАН
                </div>
              )}
              {!isCurrent && plan.recommended && (
                <div style={{
                  position: "absolute", top: -1, right: 16,
                  background: "var(--color-accent-light)", color: "#fff",
                  fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.08em",
                  padding: "0.2rem 0.75rem",
                  borderRadius: "0 0 var(--radius-sm) var(--radius-sm)",
                }}>
                  ПРЕПОРЪЧАН
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

                <ul style={{
                  listStyle: "none", padding: 0, margin: "0 0 1.75rem",
                  display: "flex", flexDirection: "column", gap: "0.625rem",
                }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ fontSize: "0.875rem", display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                      <span style={{ color: "var(--color-accent-light)", flexShrink: 0, marginTop: 1 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <button disabled className="btn-primary" style={{ opacity: 0.5, width: "100%" }}>
                    Активен
                  </button>
                ) : (
                  <button
                    className="btn-primary"
                    style={{ width: "100%" }}
                    onClick={() => subscribe(plan.priceEnvKey)}
                    disabled={loading === plan.priceEnvKey}
                  >
                    {loading === plan.priceEnvKey ? "Зарежда…" : isActive ? "Смени план" : "Абонирай се"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isActive && !cancelAtPeriodEnd && (
        <div style={{ marginTop: "1rem" }}>
          <Link href="/api/stripe/portal" className="btn-ghost-sm">
            Управление на абонамента →
          </Link>
        </div>
      )}
    </div>
  );
}
