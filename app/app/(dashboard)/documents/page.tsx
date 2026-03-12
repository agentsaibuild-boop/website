import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { DocumentsClient } from "./DocumentsClient";

export default async function DocumentsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const documents = await db.document.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      type: true,
      size: true,
      status: true,
      createdAt: true,
    },
  });

  return (
    <DocumentsClient
      documents={documents.map((d) => ({
        id: d.id,
        name: d.name,
        fileType: d.type,
        fileSize: d.size,
        status: d.status,
        createdAt: d.createdAt.toISOString(),
      }))}
    />
  );
}
