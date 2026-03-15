import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { verifyTotp, verifyBackupCode } from "@/lib/totp";

// POST /api/auth/2fa/verify – verify TOTP or backup code during login
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Неоторизиран достъп" }, { status: 401 });
  }

  const { code, isBackupCode = false } = await req.json();
  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Невалиден код" }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      twoFactorSecret: true,
      twoFactorEnabled: true,
      twoFactorBackupCodes: true,
    },
  });

  if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
    return NextResponse.json(
      { error: "2FA не е активирано за този акаунт" },
      { status: 400 }
    );
  }

  if (isBackupCode) {
    const { valid, remaining } = await verifyBackupCode(
      code,
      user.twoFactorBackupCodes
    );

    if (!valid) {
      return NextResponse.json({ error: "Невалиден backup код" }, { status: 400 });
    }

    // Remove used backup code
    await db.user.update({
      where: { id: session.user.id },
      data: { twoFactorBackupCodes: remaining },
    });

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "2FA_BACKUP_CODE_USED",
        entity: "User",
        entityId: session.user.id,
        metadata: { remainingCodes: remaining.length },
      },
    });
  } else {
    const valid = verifyTotp(code, user.twoFactorSecret);
    if (!valid) {
      return NextResponse.json(
        { error: "Невалиден или изтекъл код" },
        { status: 400 }
      );
    }
  }

  // Mark 2FA as verified in session (handled client-side by updating session)
  return NextResponse.json({ verified: true });
}
