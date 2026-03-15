interface TopBarProps {
  user: {
    name?: string | null;
    email: string;
    accountStatus: string;
  };
}

export function TopBar({ user }: TopBarProps) {
  return (
    <header className="topbar">
      <div className="topbar-left" />
      <div className="topbar-right">
        <span
          className={`status-badge status-${user.accountStatus.toLowerCase()}`}
        >
          {user.accountStatus === "ACTIVE" ? "Активен" : "Неактивен"}
        </span>
        <span className="topbar-user">{user.name ?? user.email}</span>
      </div>
    </header>
  );
}
