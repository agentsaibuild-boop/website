"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { TurnstileWidget } from "@/components/TurnstileWidget";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const registered = searchParams.get("registered") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!turnstileToken) {
      setError("Потвърди, че не си робот");
      return;
    }
    setLoading(true);
    setError("");

    // Step 1: Verify Turnstile server-side before attempting login
    const captchaRes = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ turnstileToken }),
    });
    if (!captchaRes.ok) {
      const d = await captchaRes.json();
      setError(d.error ?? "CAPTCHA грешка");
      setLoading(false);
      return;
    }

    // Step 2: Sign in with credentials
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (res?.error) {
      setError("Грешен имейл или парола");
      setLoading(false);
      return;
    }

    router.push(callbackUrl);
  }

  return (
    <>
      {registered && (
        <div style={{
          fontSize: "0.8125rem",
          color: "var(--color-success)",
          background: "var(--color-success-bg)",
          border: "1px solid #86efac",
          borderRadius: "var(--radius-sm)",
          padding: "0.625rem 0.875rem",
          marginBottom: "1rem",
        }}>
          Акаунтът е създаден успешно. Влезте, за да продължите.
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
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
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {loading ? "Влизане…" : "Влез в акаунта"}
        </button>
      </form>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-text">AIBUILD</span>
          <span className="logo-accent">AGENTS</span>
        </div>

        <h1 className="auth-title">Вход в акаунта</h1>
        <p className="auth-subtitle">
          Нямаш акаунт?{" "}
          <Link href="/register" className="auth-link">
            Регистрирай се
          </Link>
        </p>

        <Suspense fallback={<div style={{ height: 200 }} />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
