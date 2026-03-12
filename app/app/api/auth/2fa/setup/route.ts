import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  generateTotpSecret,
  encryptSecret,
  verifyTotp,
  generateBackupCodes,
} from "@/lib/totp";

// GET /api/auth/2fa/setup – generate QR code for setup
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Неоторизиран достъп" }, { status: 401 });
  }

  const { secret, qrCodeUrl, otpauthUrl } = generateTotpSecret(
    session.user.email
  );

  // Store the unconfirmed secret temporarily (encrypted)
  const encrypted = encryptSecret(secret);
  await db.user.update({
    where: { id: session.user.id },
    data: { twoFactorSecret: encrypted },
  });

  return NextResponse.json({ qrCodeUrl, otpauthUrl });
}

// POST /api/auth/2fa/setup – confirm setup with first TOTP code
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Неоторизиран достъп" }, { status: 401 });
  }

  const { code } = await req.json();
  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Невалиден код" }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { twoFactorSecret: true },
  });

  if (!user?.twoFactorSecret) {
    return NextResponse.json(
      { error: "Няма активен setup процес. Инициирайте отново." },
      { status: 400 }
    );
  }

  const valid = verifyTotp(code, user.twoFactorSecret);
  if (!valid) {
    return NextResponse.json({ error: "Невалиден или изтекъл код" }, { status: 400 });
  }

  // Generate backup codes
  const { plain, hashed } = await generateBackupCodes();

  await db.user.update({
    where: { id: session.user.id },
    data: {
      twoFactorEnabled: true,
      twoFactorBackupCodes: hashed,
    },
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "2FA_ENABLED",
      entity: "User",
      entityId: session.user.id,
    },
  });

  return NextResponse.json({
    message: "2FA е активирано успешно",
    backupCodes: plain, // shown ONCE – user must save them
  });
}
