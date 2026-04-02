"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function TwoFactorVerifyPage() {
  const router = useRouter();
  const { update } = useSession();
  const [code, setCode] = useState("");
  const [isBackup, setIsBackup] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/2fa/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, isBackupCode: isBackup }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Невалиден код");
      setLoading(false);
      return;
    }

    // Update JWT to mark 2FA as verified — clears the middleware gate
    await update({ twoFactorVerified: true });
    router.push("/dashboard");
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-text">AIBUILD</span>
          <span className="logo-accent">AGENTS</span>
        </div>

        <h1 className="auth-title">Двуфакторна верификация</h1>
        <p className="auth-subtitle">
          {isBackup
            ? "Въведи backup код от запазения списък"
            : "Въведи 6-цифрения код от Google Authenticator или Authy"}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label htmlFor="code">
              {isBackup ? "Backup код" : "Код за верификация"}
            </label>
            <input
              id="code"
              type="text"
              inputMode={isBackup ? "text" : "numeric"}
              pattern={isBackup ? undefined : "[0-9]{6}"}
              maxLength={isBackup ? 8 : 6}
              autoComplete="one-time-code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={isBackup ? "XXXXXXXX" : "000000"}
              className="code-input"
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Верификация…" : "Потвърди"}
          </button>

          <button
            type="button"
            onClick={() => { setIsBackup(!isBackup); setCode(""); setError(""); }}
            className="auth-link-btn"
          >
            {isBackup
              ? "← Използвай Authenticator приложение"
              : "Нямам достъп до телефона — използвай backup код"}
          </button>
        </form>
      </div>
    </div>
  );
}
