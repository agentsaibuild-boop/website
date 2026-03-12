"use client";

import { useEffect, useState } from "react";

type SetupState =
  | { phase: "loading" }
  | { phase: "scan"; qrUrl: string; secret: string }
  | { phase: "done"; backupCodes: string[] };

export default function TwoFactorSetupPage() {
  const [state, setState] = useState<SetupState>({ phase: "loading" });
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/auth/2fa/setup")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setState({ phase: "scan", qrUrl: data.qrUrl, secret: data.secret });
        }
      })
      .catch(() => setError("Грешка при зареждане"));
  }, []);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const res = await fetch("/api/auth/2fa/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error || "Невалиден код");
    } else {
      setState({ phase: "done", backupCodes: data.backupCodes });
    }
  }

  if (state.phase === "loading") {
    return (
      <div className="page-content">
        <div className="page-header">
          <h1>Настройка на 2FA</h1>
          <p className="page-subtitle">Зарежда се…</p>
        </div>
      </div>
    );
  }

  if (state.phase === "done") {
    return (
      <div className="page-content">
        <div className="page-header">
          <h1>2FA е активирана</h1>
          <p className="page-subtitle">
            Запазете резервните кодове на сигурно място. Показват се само веднъж.
          </p>
        </div>

        <div className="section-card" style={{ maxWidth: 480 }}>
          <div className="section-card-header">
            <h2>Резервни кодове</h2>
          </div>
          <div style={{ padding: "1.25rem 1.5rem" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.5rem",
                fontFamily: "var(--font-mono)",
                fontSize: "0.875rem",
                marginBottom: "1.25rem",
              }}
            >
              {state.backupCodes.map((c) => (
                <span
                  key={c}
                  style={{
                    background: "var(--color-surface-2)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-sm)",
                    padding: "0.375rem 0.75rem",
                    letterSpacing: "0.1em",
                  }}
                >
                  {c}
                </span>
              ))}
            </div>
            <a href="/dashboard" className="btn-primary" style={{ display: "block", textDecoration: "none", textAlign: "center" }}>
              Готово — към таблото
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Настройка на 2FA</h1>
        <p className="page-subtitle">
          Сканирайте QR кода с Google Authenticator или Authy, след което въведете 6-цифрения код.
        </p>
      </div>

      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", alignItems: "flex-start" }}>
        <div className="section-card" style={{ maxWidth: 320 }}>
          <div className="section-card-header">
            <h2>QR код</h2>
          </div>
          <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={state.qrUrl} alt="TOTP QR code" width={200} height={200} style={{ borderRadius: "var(--radius-sm)" }} />
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "0.75rem", color: "var(--color-muted)", margin: "0 0 0.25rem" }}>
                Или въведете ръчно:
              </p>
              <code
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  background: "var(--color-surface-2)",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "var(--radius-sm)",
                  wordBreak: "break-all",
                }}
              >
                {state.secret}
              </code>
            </div>
          </div>
        </div>

        <div className="section-card" style={{ maxWidth: 320, flex: 1 }}>
          <div className="section-card-header">
            <h2>Потвърждение</h2>
          </div>
          <div style={{ padding: "1.5rem" }}>
            <form onSubmit={handleVerify} className="auth-form">
              {error && <p className="auth-error">{error}</p>}
              <div className="field">
                <label htmlFor="code">6-цифрен код от приложението</label>
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="code-input"
                  placeholder="000000"
                  required
                />
              </div>
              <button type="submit" className="btn-primary" disabled={submitting || code.length !== 6}>
                {submitting ? "Проверява се…" : "Активирай 2FA"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
