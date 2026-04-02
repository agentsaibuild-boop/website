import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { APPLICATIONS } from "@/lib/applications";

export default async function ApplicationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Приложения</h1>
        <p className="page-subtitle">Изберете AI приложение и активирайте абонамент</p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "1.25rem",
      }}>
        {APPLICATIONS.map((app) => (
          <div
            key={app.slug}
            className="section-card"
            style={{
              padding: "1.5rem",
              border: "1px solid var(--color-border)",
              position: "relative",
              opacity: app.available ? 1 : 0.6,
            }}
          >
            {app.badge && (
              <span style={{
                position: "absolute",
                top: 12,
                right: 12,
                background: app.badge === "СКОРО" ? "var(--color-muted)" : "var(--color-accent)",
                color: "#fff",
                fontSize: "0.625rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                padding: "0.2rem 0.6rem",
                borderRadius: "var(--radius-sm)",
              }}>
                {app.badge}
              </span>
            )}

            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{app.icon}</div>
            <h2 style={{ fontSize: "1.0625rem", fontWeight: 700, margin: "0 0 0.5rem" }}>
              {app.name}
            </h2>
            <p style={{ fontSize: "0.875rem", color: "var(--color-muted)", margin: "0 0 1.25rem", lineHeight: 1.5 }}>
              {app.description}
            </p>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              {app.available ? (
                <>
                  <span style={{ fontSize: "0.8125rem", color: "var(--color-muted)" }}>
                    {app.plans.length} {app.plans.length === 1 ? "план" : "плана"}
                  </span>
                  <Link
                    href={`/applications/${app.slug}`}
                    className="btn-primary"
                    style={{ padding: "0.5rem 1.25rem", fontSize: "0.875rem" }}
                  >
                    Виж планове →
                  </Link>
                </>
              ) : (
                <span style={{ fontSize: "0.8125rem", color: "var(--color-muted)" }}>
                  Скоро налично
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
