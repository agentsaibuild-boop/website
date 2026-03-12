import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [user, documents] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    }),
    db.document.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const isActive = user?.accountStatus === "ACTIVE";

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p className="page-subtitle">Добре дошъл, {session.user.name?.split(" ")[0] ?? "потребителю"}</p>
      </div>

      {/* Account status banner */}
      {!isActive && (
        <div className="banner banner-warning">
          <p>
            <strong>Акаунтът не е активиран.</strong> Абонирай се, за да получиш
            достъп до платформата.
          </p>
          <a href="/pricing" className="btn-sm">
            Избери план →
          </a>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">Документи</p>
          <p className="stat-value">{documents.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Статус</p>
          <p className={`stat-value status-${user?.accountStatus?.toLowerCase()}`}>
            {user?.accountStatus === "ACTIVE"
              ? "Активен"
              : user?.accountStatus === "INACTIVE"
                ? "Неактивен"
                : user?.accountStatus === "EXPIRED"
                  ? "Изтекъл"
                  : "Суспендиран"}
          </p>
        </div>
        <div className="stat-card">
          <p className="stat-label">План</p>
          <p className="stat-value">
            {user?.subscription?.plan ?? "—"}
          </p>
        </div>
        <div className="stat-card">
          <p className="stat-label">2FA</p>
          <p className={`stat-value ${user?.twoFactorEnabled ? "status-active" : "status-inactive"}`}>
            {user?.twoFactorEnabled ? "Активирано" : "Неактивирано"}
          </p>
        </div>
      </div>

      {/* Recent documents */}
      <div className="section-card">
        <div className="section-card-header">
          <h2>Последни документи</h2>
          <a href="/documents" className="btn-ghost-sm">Виж всички</a>
        </div>

        {documents.length === 0 ? (
          <div className="empty-state">
            <p>Нямаш качени документи все още.</p>
            {isActive && (
              <a href="/documents/upload" className="btn-sm">
                Качи документ
              </a>
            )}
          </div>
        ) : (
          <div className="document-list">
            {documents.map((doc) => (
              <div key={doc.id} className="document-row">
                <div className="doc-icon">{doc.type}</div>
                <div className="doc-info">
                  <p className="doc-name">{doc.name}</p>
                  <p className="doc-meta">
                    {(doc.size / 1024).toFixed(0)} KB ·{" "}
                    {new Date(doc.createdAt).toLocaleDateString("bg-BG")}
                  </p>
                </div>
                <span className={`doc-status status-${doc.status.toLowerCase()}`}>
                  {doc.status === "COMPLETED"
                    ? "Готово"
                    : doc.status === "PROCESSING"
                      ? "Обработва се"
                      : doc.status === "FAILED"
                        ? "Грешка"
                        : "Качено"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
