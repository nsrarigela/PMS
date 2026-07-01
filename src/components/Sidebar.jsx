import { Link, useLocation } from "react-router-dom";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/reports", label: "Reports" },
];

export default function Sidebar({ user, onLogout }) {
  const location = useLocation(); // react-router-dom's equivalent of next's usePathname()
  const pathname = location.pathname;

  return (
    <nav className="sidebar">
      <div className="sidebar-brand">PMS</div>

      {LINKS.map((link) => {
        const active = pathname === link.href || pathname.startsWith(link.href + "/");
        return (
          <Link key={link.href} to={link.href} className={`sidebar-link${active ? " active" : ""}`}>
            {link.label}
          </Link>
        );
      })}

      {user && (
        <div className="sidebar-user">
          <strong>{user.name}</strong>
          {user.role}
          <button className="logout-btn" onClick={onLogout}>
            Log out
          </button>
        </div>
      )}
    </nav>
  );
}
