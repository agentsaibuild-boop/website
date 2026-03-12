import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      twoFactorEnabled: true,
      accountStatus: true,
      createdAt: true,
    },
  });

  if (!user) redirect("/login");

  return (
    <SettingsClient
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        twoFactorEnabled: user.twoFactorEnabled,
        accountStatus: user.accountStatus,
        createdAt: user.createdAt.toISOString(),
      }}
    />
  );
}
