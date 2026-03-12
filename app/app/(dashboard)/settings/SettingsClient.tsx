"use client";

import { useState } from "react";
import Link from "next/link";

interface Props {
  user: {
    id: string;
    name: string | null;
    email: string;
    twoFactorEnabled: boolean;
    accountStatus: string;
    createdAt: string;
  };
}

export function SettingsClient({ user }: Props) {
  const [name, setName] = useState(user.name ?? "");
  const [profileMsg, setProfileMsg] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  const [disabling2fa, setDisabling2fa] = useState(false);
  const [twoFaMsg, setTwoFaMsg] = useState("");
  const [twoFaEnabled, setTwoFaEnabled] = useState(user.twoFactorEnabled);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileMsg("");
    setProfileError("");
    setProfileSaving(true);
    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setProfileSaving(false);
    if (res.ok) {
      setProfileMsg("Профилът е запазен.");
    } else {
      const d = await res.json();
      setProfileError(d.error || "Грешка");
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg("");
    setPwError("");
    if (newPw !== confirmPw) {
      setPwError("Паролите не съвпадат");
      return;
    }
    setPwSaving(true);
    const res = await fetch("/api/user/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
    });
    setPwSaving(false);
    if (res.ok) {
      setPwMsg("Паролата е сменена.");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } else {
      const d = await res.json();
      setPwError(d.error || "Грешка");
    }
  }

  async function disable2fa() {
    if (!confirm("Сигурни ли сте, че искате да деактивирате 2FA?")) return;
    setDisabling2fa(true);
    setTwoFaMsg("");
    const res = await fetch("/api/auth/2fa/disable", { method: "POST" });
    setDisabling2fa(false);
    if (res.ok) {
      setTwoFaEnabled(false);
      setTwoFaMsg("2FA е деактивирана.");
    } else {
      setTwoFaMsg("Грешка при деактивиране.");
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Настройки</h1>
        <p className="page-subtitle">Управление на профила и сигурността</p>
      </div>

      {/* Profile */}
      <div className="section-card" style={{ maxWidth: 520 }}>
        <div className="section-card-header">
          <h2>Профил</h2>
        </div>
        <div style={{ padding: "1.5rem" }}>
          <form onSubmit={saveProfile} className="auth-form">
            {profileMsg && (
              <p style={{ fontSize: "0.8125rem", color: "var(--color-success)", margin: 0 }}>{profileMsg}</p>
            )}
            {profileError && <p className="auth-error">{profileError}</p>}
            <div className="field">
              <label htmlFor="name">Име</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Имейл</label>
              <input type="email" value={user.email} disabled style={{ opacity: 0.5 }} />
            </div>
            <button type="submit" className="btn-primary" disabled={profileSaving}>
              {profileSaving ? "Запазване…" : "Запази промените"}
            </button>
          </form>
        </div>
      </div>

      {/* Password */}
      <div className="section-card" style={{ maxWidth: 520 }}>
        <div className="section-card-header">
          <h2>Смяна на парола</h2>
        </div>
        <div style={{ padding: "1.5rem" }}>
          <form onSubmit={changePassword} className="auth-form">
            {pwMsg && (
              <p style={{ fontSize: "0.8125rem", color: "var(--color-success)", margin: 0 }}>{pwMsg}</p>
            )}
            {pwError && <p className="auth-error">{pwError}</p>}
            <div className="field">
              <label htmlFor="current-pw">Текуща парола</label>
              <input
                id="current-pw"
                type="password"
                autoComplete="current-password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="new-pw">Нова парола</label>
              <input
                id="new-pw"
                type="password"
                autoComplete="new-password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                minLength={8}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="confirm-pw">Потвърди нова парола</label>
              <input
                id="confirm-pw"
                type="password"
                autoComplete="new-password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={pwSaving}>
              {pwSaving ? "Смяна…" : "Смени паролата"}
            </button>
          </form>
        </div>
      </div>

      {/* 2FA */}
      <div className="section-card" style={{ maxWidth: 520 }}>
        <div className="section-card-header">
          <h2>Двуфакторна автентикация</h2>
          <span className={`status-badge ${twoFaEnabled ? "status-active" : "status-inactive"}`}>
            {twoFaEnabled ? "ВКЛЮЧЕНА" : "ИЗКЛЮЧЕНА"}
          </span>
        </div>
        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          {twoFaMsg && (
            <p style={{ fontSize: "0.8125rem", color: "var(--color-muted)", margin: 0 }}>{twoFaMsg}</p>
          )}
          <p style={{ fontSize: "0.875rem", color: "var(--color-muted)", margin: 0 }}>
            {twoFaEnabled
              ? "2FA е активна. При всяко влизане ще трябва да въведете код от приложението."
              : "Активирайте 2FA за допълнителна защита на акаунта."}
          </p>
          {twoFaEnabled ? (
            <button
              className="btn-primary"
              style={{ background: "var(--color-error)", maxWidth: 200 }}
              onClick={disable2fa}
              disabled={disabling2fa}
            >
              {disabling2fa ? "Деактивира се…" : "Деактивирай 2FA"}
            </button>
          ) : (
            <Link href="/2fa/setup" className="btn-primary" style={{ display: "inline-block", textDecoration: "none", textAlign: "center", maxWidth: 200 }}>
              Активирай 2FA
            </Link>
          )}
        </div>
      </div>

      {/* Account info */}
      <div className="section-card" style={{ maxWidth: 520 }}>
        <div className="section-card-header">
          <h2>Информация за акаунта</h2>
        </div>
        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
            <span style={{ color: "var(--color-muted)" }}>Статус</span>
            <span className={`status-badge status-${user.accountStatus.toLowerCase()}`}>
              {user.accountStatus}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
            <span style={{ color: "var(--color-muted)" }}>Регистриран на</span>
            <span>{new Date(user.createdAt).toLocaleDateString("bg-BG")}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
            <span style={{ color: "var(--color-muted)" }}>ID</span>
            <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>{user.id}</code>
          </div>
        </div>
      </div>
    </div>
  );
}
