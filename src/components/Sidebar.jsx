import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FolderKanban, ListChecks, BarChart3, User, LogOut } from "lucide-react";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/my-tasks", label: "My Tasks", icon: ListChecks },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User },
];

export default function Sidebar({ user, onLogout }) {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">P</div>
        <span>PMS</span>
      </div>

      {LINKS.map((link) => {
        const active = pathname === link.href || pathname.startsWith(link.href + "/");
        const Icon = link.icon;
        return (
          <Link key={link.href} to={link.href} className={`sidebar-link${active ? " active" : ""}`}>
            <Icon size={17} strokeWidth={2} />
            <span>{link.label}</span>
          </Link>
        );
      })}

      {user && (
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{user.name.charAt(0)}</div>
          <div>
            <strong>{user.name}</strong>
            <span>{user.role}</span>
          </div>
          <button className="logout-btn" onClick={onLogout} title="Log out">
            <LogOut size={15} />
          </button>
        </div>
      )}
    </nav>
  );
}