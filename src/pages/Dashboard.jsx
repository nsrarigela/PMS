import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useSession } from "../lib/useSession";
import { getProjects, getAllTasks, getUsers } from "../lib/store";

const STATUS_LABELS = { todo: "To Do", "in-progress": "In Progress", review: "In Review", done: "Done" };

export default function Dashboard() {
  const { user, ready, logout } = useSession();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!ready) return;
    setProjects(getProjects());
    setTasks(getAllTasks());
  }, [ready]);

  if (!ready) return null;

  const openBugs = tasks.filter((t) => t.type === "bug" && t.status !== "done").length;
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const completion = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

  const byStatus = Object.keys(STATUS_LABELS).map((key) => ({
    key,
    label: STATUS_LABELS[key],
    count: tasks.filter((t) => t.status === key).length,
  }));
  const maxCount = Math.max(1, ...byStatus.map((s) => s.count));

  return (
    <div className="app-shell">
      <Sidebar user={user} onLogout={logout} />
      <main className="content">
        <div className="page-header">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back, {user.name.split(" ")[0]} &middot; {user.role}</p>
          </div>
        </div>

        <div className="stat-grid">
          <div className="card stat-card">
            <div className="stat-value">{projects.length}</div>
            <div className="stat-label">Active projects</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value">{tasks.length}</div>
            <div className="stat-label">Total tasks</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value">{openBugs}</div>
            <div className="stat-label">Open bugs</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value">{completion}%</div>
            <div className="stat-label">Tasks completed</div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16, fontSize: 15 }}>Tasks by status</h3>
          {byStatus.map((s) => (
            <div className="bar-row" key={s.key}>
              <div className="name">{s.label}</div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${(s.count / maxCount) * 100}%` }} />
              </div>
              <div className="count">{s.count}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 12, fontSize: 15 }}>Your projects</h3>
          {projects.length === 0 && <p className="empty-state">No projects yet.</p>}
          {projects.map((p) => (
            <Link key={p.id} to={`/projects/${p.id}`} className="sidebar-link" style={{ color: "var(--text)", display: "block", padding: "8px 4px" }}>
              {p.name}
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
