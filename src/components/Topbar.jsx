import { Search, Bell } from "lucide-react";

export default function Topbar({ user }) {
  return (
    <div className="topbar">
      <div className="topbar-search">
        <Search size={16} />
        <input placeholder="Search tasks or projects..." />
      </div>

      <div className="topbar-right">
        <span className="topbar-role-badge">{user.role}</span>
        <button className="topbar-icon-btn"><Bell size={18} /></button>
        <div className="topbar-user">
          <strong>{user.name}</strong>
          <span>My Workspace</span>
        </div>
      </div>
    </div>
  );
}