"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TurnstileWidget } from "@/components/TurnstileWidget";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Паролите не съвпадат");
      return;
    }
    if (password.length < 8) {
      setError("Паролата трябва да е минимум 8 символа");
      return;
    }
    if (!turnstileToken) {
      setError("Потвърди, че не си робот");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, turnstileToken }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Грешка при регистрацията");
      setLoading(false);
      return;
    }

    router.push("/login?registered=1");
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-text">AIBUILD</span>
          <span className="logo-accent">AGENTS</span>
        </div>

        <h1 className="auth-title">Създай акаунт</h1>
        <p className="auth-subtitle">
          Вече имаш акаунт?{" "}
          <Link href="/login" className="auth-link">
            Влез
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label htmlFor="name">Пълно име</label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Иван Иванов"
            />
          </div>

          <div className="field">
            <label htmlFor="email">Имейл адрес</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.bg"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Парола</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Минимум 8 символа"
            />
          </div>

          <div className="field">
            <label htmlFor="confirm">Потвърди паролата</label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <TurnstileWidget onVerify={setTurnstileToken} />

          {error && <p className="auth-error">{error}</p>}

          <button
            type="submit"
            disabled={loading || !turnstileToken}
            className="btn-primary"
          >
            {loading ? "Създаване…" : "Създай акаунт"}
          </button>

          <p className="auth-terms">
            Регистрирайки се, приемаш нашата{" "}
            <a href="https://aibuildagents.bg/politika-za-poveritelnost" className="auth-link">
              Политика за поверителност
            </a>
            .
          </p>
        </form>
      </div>
    </div>
  );
}
