import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { verifyTurnstile } from "@/lib/turnstile";

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  turnstileToken: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Невалидни данни", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password, turnstileToken } = parsed.data;

    // Verify Turnstile CAPTCHA
    const captchaOk = await verifyTurnstile(turnstileToken);
    if (!captchaOk) {
      return NextResponse.json(
        { error: "CAPTCHA верификацията неуспешна" },
        { status: 400 }
      );
    }

    // Check if email exists
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Акаунт с този имейл вече съществува" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user + subscription record
    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        accountStatus: "INACTIVE", // activated after payment
        subscription: {
          create: {
            status: "INACTIVE",
            plan: "STARTER",
          },
        },
      },
      select: { id: true, email: true, name: true },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "USER_REGISTERED",
        entity: "User",
        entityId: user.id,
        ip: req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? null,
      },
    });

    return NextResponse.json(
      { message: "Акаунтът е създаден успешно", userId: user.id },
      { status: 201 }
    );
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json(
      { error: "Вътрешна грешка на сървъра" },
      { status: 500 }
    );
  }
}
