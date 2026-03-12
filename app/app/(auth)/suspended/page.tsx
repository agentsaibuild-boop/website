import { signOut } from "@/auth";

export default function SuspendedPage() {
  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: "center" }}>
        <div className="auth-logo" style={{ justifyContent: "center" }}>
          <span className="logo-text">AIBUILD</span>
          <span className="logo-accent">AGENTS</span>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "rgba(248,113,113,0.1)",
              border: "1px solid rgba(248,113,113,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
              fontSize: "1.25rem",
            }}
          >
            ✕
          </div>
          <h1 className="auth-title">Акаунтът е спрян</h1>
          <p className="auth-subtitle">
            Акаунтът ви е временно деактивиран. Моля свържете се с поддръжката
            за повече информация.
          </p>
        </div>

        <a
          href="mailto:support@aibuild.bg"
          className="btn-primary"
          style={{ display: "block", textDecoration: "none", marginBottom: "1rem" }}
        >
          Свържете се с поддръжката
        </a>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button type="submit" className="auth-link-btn" style={{ width: "100%", textAlign: "center" }}>
            Изход от акаунта
          </button>
        </form>
      </div>
    </div>
  );
}
