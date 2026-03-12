import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

const ALLOWED_TYPES: Record<string, "PDF" | "DOCX" | "XLSX"> = {
  "application/pdf": "PDF",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  "application/msword": "DOCX",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
  "application/vnd.ms-excel": "XLSX",
  "text/plain": "PDF", // store txt as generic
  "text/csv": "XLSX",
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Няма файл" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Файлът е прекалено голям (макс. 20 MB)" }, { status: 400 });
  }

  const docType = ALLOWED_TYPES[file.type] ?? null;
  if (!docType) {
    return NextResponse.json({ error: "Неподдържан тип файл" }, { status: 400 });
  }

  // Save file to uploads directory
  const uploadsDir = path.join(process.cwd(), "uploads", session.user.id);
  await mkdir(uploadsDir, { recursive: true });

  const safeFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const filePath = path.join(uploadsDir, safeFileName);
  const storageKey = `${session.user.id}/${safeFileName}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  const doc = await db.document.create({
    data: {
      userId: session.user.id,
      name: file.name,
      type: docType,
      size: file.size,
      status: "UPLOADED",
      storageKey,
    },
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "DOCUMENT_UPLOADED",
      entity: "Document",
      entityId: doc.id,
      metadata: { name: file.name, size: file.size },
    },
  });

  return NextResponse.json({
    id: doc.id,
    name: doc.name,
    fileType: doc.type,
    fileSize: doc.size,
    status: doc.status,
    createdAt: doc.createdAt.toISOString(),
  });
}
