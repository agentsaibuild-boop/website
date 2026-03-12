import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { unlink } from "fs/promises";
import path from "path";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const doc = await db.document.findUnique({ where: { id } });
  if (!doc || doc.userId !== session.user.id) {
    return NextResponse.json({ error: "Не е намерен" }, { status: 404 });
  }

  // Delete file from disk
  try {
    const filePath = path.join(process.cwd(), "uploads", doc.storageKey);
    await unlink(filePath);
  } catch {
    // File may not exist on disk — continue anyway
  }

  await db.document.delete({ where: { id } });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "DOCUMENT_DELETED",
      entity: "Document",
      entityId: id,
      metadata: { name: doc.name },
    },
  });

  return NextResponse.json({ ok: true });
}
