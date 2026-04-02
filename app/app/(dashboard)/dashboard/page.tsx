import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [user, documents, totalDocs] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    }),
    db.document.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.document.count({ where: { userId: session.user.id } }),
  ]);

  const isActive = user?.accountStatus === "ACTIVE";

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Табло</h1>
        <p className="page-subtitle">
          Добре дошъл, {session.user.name?.split(" ")[0] ?? "потребителю"}
        </p>
      </div>

      {!isActive && (
        <div className="banner banner-warning">
          <p>
            <strong>Акаунтът не е активиран.</strong> Абонирай се, за да
            получиш достъп до платформата.
          </p>
          <Link href="/pricing" className="btn-sm">
            Избери план →
          </Link>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">Документи</p>
          <p className="stat-value">{totalDocs}</p>
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
          <p className="stat-value">{user?.subscription?.plan ?? "—"}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">2FA</p>
          <p
            className={`stat-value ${
              user?.twoFactorEnabled ? "status-active" : "status-inactive"
            }`}
          >
            {user?.twoFactorEnabled ? "Активирано" : "Неактивирано"}
          </p>
        </div>
      </div>

      <div className="section-card">
        <div className="section-card-header">
          <h2>Последни документи</h2>
          <Link href="/documents" className="btn-ghost-sm">
            Виж всички
          </Link>
        </div>

        {documents.length === 0 ? (
          <div className="empty-state">
            <span style={{ fontSize: "2rem", opacity: 0.3 }}>📄</span>
            <span>Нямаш качени документи все още.</span>
            {isActive && (
              <Link href="/documents" className="btn-sm">
                Качи документ
              </Link>
            )}
          </div>
        ) : (
          <div className="document-list">
            {documents.map((doc) => (
              <div key={doc.id} className="document-row">
                <span className="doc-icon">{doc.type}</span>
                <div className="doc-info">
                  <p className="doc-name">{doc.name}</p>
                  <p className="doc-meta">
                    {(doc.size / 1024).toFixed(0)} KB ·{" "}
                    {new Date(doc.createdAt).toLocaleDateString("bg-BG")}
                  </p>
                </div>
                <span className={`status-badge status-${doc.status.toLowerCase()}`}>
                  {doc.status === "COMPLETED"
                    ? "завършен"
                    : doc.status === "PROCESSING"
                      ? "обработва се"
                      : doc.status === "FAILED"
                        ? "грешка"
                        : "качен"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
