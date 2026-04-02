import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      accountStatus: true,
      role: true,
      twoFactorEnabled: true,
      createdAt: true,
      lastLoginAt: true,
      subscription: {
        select: { plan: true, status: true },
      },
    },
  });

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Администрация</h1>
        <p className="page-subtitle">{users.length} потребители общо</p>
      </div>

      <div className="section-card">
        <div className="section-card-header">
          <h2>Потребители</h2>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)", textAlign: "left" }}>
                {["Потребител", "Статус", "План", "Роля", "2FA", "Регистрация", "Последен вход"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "0.75rem 1.5rem",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "var(--color-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "0.875rem 1.5rem" }}>
                    <p style={{ margin: 0, fontWeight: 500 }}>{user.name ?? "—"}</p>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-muted)" }}>
                      {user.email}
                    </p>
                  </td>
                  <td style={{ padding: "0.875rem 1.5rem" }}>
                    <span className={`status-badge status-${user.accountStatus.toLowerCase()}`}>
                      {user.accountStatus}
                    </span>
                  </td>
                  <td style={{ padding: "0.875rem 1.5rem", color: "var(--color-muted)" }}>
                    {user.subscription?.plan ?? "—"}
                  </td>
                  <td style={{ padding: "0.875rem 1.5rem" }}>
                    <span
                      className="status-badge"
                      style={
                        user.role === "ADMIN"
                          ? { color: "#a78bfa", background: "rgba(167,139,250,0.1)" }
                          : undefined
                      }
                    >
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: "0.875rem 1.5rem" }}>
                    <span className={`status-badge ${user.twoFactorEnabled ? "status-active" : "status-inactive"}`}>
                      {user.twoFactorEnabled ? "ДА" : "НЕ"}
                    </span>
                  </td>
                  <td style={{ padding: "0.875rem 1.5rem", color: "var(--color-muted)", whiteSpace: "nowrap" }}>
                    {new Date(user.createdAt).toLocaleDateString("bg-BG")}
                  </td>
                  <td style={{ padding: "0.875rem 1.5rem", color: "var(--color-muted)", whiteSpace: "nowrap" }}>
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleDateString("bg-BG")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
