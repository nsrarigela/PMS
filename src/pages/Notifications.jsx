import { useState } from "react";
import { Bell } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useSession } from "../lib/useSession";

export default function Notifications() {
  const { user, ready, logout } = useSession();
  const [notifications] = useState([]);

  if (!ready) return null;

  return (
    <div className="app-shell">
      <Sidebar user={user} onLogout={logout} />
      <div className="main-col">
        <Topbar user={user} />
        <main className="content">
          <div className="page-header">
            <div>
              <h1>Notifications</h1>
              <p>Stay updated with task assignments, comments, and project milestones.</p>
            </div>
            <button className="btn" disabled={notifications.length === 0}>
              Mark all read
            </button>
          </div>

          <div className="card">
            <h3 style={{ fontSize: 15, marginBottom: 4 }}>Recent Activity</h3>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>
              All notifications from your team and assigned workflows.
            </p>

            {notifications.length === 0 ? (
              <div className="empty-state" style={{ padding: "56px 20px" }}>
                <div className="notif-empty-icon">
                  <Bell size={28} />
                </div>
                <p style={{ fontWeight: 600, fontSize: 15, color: "var(--text)", marginTop: 16 }}>
                  No notifications
                </p>
                <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
                  We will let you know when new events occur or match your search.
                </p>
              </div>
            ) : (
              <div>
                {notifications.map((n) => (
                  <div key={n.id} className="card" style={{ marginBottom: 10 }}>
                    <strong style={{ fontSize: 13.5 }}>{n.title}</strong>
                    <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 4 }}>{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}