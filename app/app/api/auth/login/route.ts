import { NextRequest, NextResponse } from "next/server";
import { verifyTurnstile } from "@/lib/turnstile";

// POST /api/auth/login – verify Turnstile before signIn
// Client calls this first, then calls signIn if ok
export async function POST(req: NextRequest) {
  const { turnstileToken } = await req.json();
  if (!turnstileToken || typeof turnstileToken !== "string") {
    return NextResponse.json({ error: "Липсва CAPTCHA токен" }, { status: 400 });
  }

  const ok = await verifyTurnstile(turnstileToken);
  if (!ok) {
    return NextResponse.json(
      { error: "CAPTCHA верификацията неуспешна. Опитай отново." },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
