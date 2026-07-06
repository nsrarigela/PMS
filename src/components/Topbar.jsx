import { Search, Bell } from "lucide-react";
import { Link } from "react-router-dom";

export default function Topbar({ user }) {
  return (
    <div className="topbar">
      <div className="topbar-search">
        <Search size={16} />
        <input placeholder="Search tasks or projects..." />
      </div>

      <div className="topbar-right">
        <span className="topbar-role-badge">{user.role}</span>

        <Link to="/notifications" className="topbar-icon-btn" title="Notifications">
          <Bell size={18} />
        </Link>

        <div className="topbar-user">
          <strong>{user.name}</strong>
          <span>My Workspace</span>
        </div>
      </div>
    </div>
  );
}