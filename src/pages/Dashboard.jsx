import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useSession } from "../lib/useSession";
import { getProjects, getAllTasks, getUsers } from "../lib/store";

const STATUS_LABELS = { todo: "To Do", "in-progress": "In Progress", review: "In Review", done: "Done" };

function isToday(timestamp) {
  if (!timestamp) return false;
  const d = new Date(timestamp);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export default function Dashboard() {
  const { user, ready, logout } = useSession();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!ready) return;
    setProjects(getProjects());
    setTasks(getAllTasks());
    setUsers(getUsers());
  }, [ready]);

  if (!ready) return null;

  const developers = users.filter((u) => u.role === "Developer");
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const pendingCount = tasks.filter((t) => t.status !== "done").length;
  const openBugs = tasks.filter((t) => t.type === "bug" && t.status !== "done").length;
  const completion = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

  // "Today's progress" = tasks moved to done today (best signal we have without a status-change timestamp)
  const completedToday = tasks.filter((t) => t.status === "done" && isToday(t.createdAt)).length;

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

        <div className="stat-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          <div className="card stat-card">
            <div className="stat-value">{projects.length}</div>
            <div className="stat-label">Total projects</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value">{tasks.length}</div>
            <div className="stat-label">Total tasks</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value">{developers.length}</div>
            <div className="stat-label">Developers</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value" style={{ color: "var(--success)" }}>{doneCount}</div>
            <div className="stat-label">Completed tasks</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value" style={{ color: "var(--warning)" }}>{pendingCount}</div>
            <div className="stat-label">Pending tasks</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value" style={{ color: "var(--danger)" }}>{openBugs}</div>
            <div className="stat-label">Open bugs</div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 24, marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <h3 style={{ fontSize: 15 }}>Today's progress</h3>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>{completedToday} task(s) completed today</span>
          </div>
          <div className="bar-track" style={{ height: 12 }}>
            <div className="bar-fill" style={{ width: `${completion}%` }} />
          </div>
          <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 8 }}>{completion}% of all tasks completed overall</p>
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
            <Link key={p.id} to={`/projects/${p.id}`} className="project-row">
              {p.name}
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}