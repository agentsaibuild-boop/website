"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const nav = [
  { href: "/dashboard", label: "Табло", icon: "⬛" },
  { href: "/documents", label: "Документи", icon: "📄" },
  { href: "/pricing", label: "Планове", icon: "💳" },
  { href: "/settings", label: "Настройки", icon: "⚙️" },
];

interface SidebarProps {
  user: {
    name?: string | null;
    email: string;
    role: string;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-text">AIBUILD</span>
        <span className="logo-accent">AGENTS</span>
      </div>

      <nav className="sidebar-nav">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${pathname === item.href ? "active" : ""}`}
          >
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}

        {user.role === "ADMIN" && (
          <Link
            href="/admin"
            className={`nav-item ${pathname.startsWith("/admin") ? "active" : ""}`}
          >
            <span className="nav-icon" aria-hidden="true">🛠️</span>
            <span>Admin</span>
          </Link>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <p className="user-name">{user.name ?? user.email}</p>
          <p className="user-email">{user.email}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="signout-btn"
        >
          Изход
        </button>
      </div>
    </aside>
  );
}
