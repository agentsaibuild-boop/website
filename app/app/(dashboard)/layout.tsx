import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) redirect("/login");

  // If 2FA is enabled but not yet verified in this session
  if (session.user.twoFactorEnabled && !session.user.twoFactorVerified) {
    redirect("/2fa/verify");
  }

  return (
    <div className="dashboard-shell">
      <Sidebar user={session.user} />
      <div className="dashboard-main">
        <TopBar user={session.user} />
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}
