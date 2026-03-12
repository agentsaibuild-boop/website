// Cloudflare Turnstile CAPTCHA verification
// Blocks AI agents, bots, and automated attacks

const TURNSTILE_SECRET = process.env.CLOUDFLARE_TURNSTILE_SECRET!;
const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(token: string): Promise<boolean> {
  if (process.env.NODE_ENV === "development" && token === "dev-bypass") {
    return true; // Allow bypass in dev only
  }

  const res = await fetch(VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: TURNSTILE_SECRET,
      response: token,
    }),
  });

  const data: { success: boolean; "error-codes"?: string[] } = await res.json();
  return data.success === true;
}
