import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useSession } from "../lib/useSession";
import { getProjects, getAllTasks, getUsers, getAllBugs } from "../lib/store";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const STATUS_COLORS = {
  todo: "#4b3fd6",
  "in-progress": "#b3790a",
  review: "#2a63c9",
  done: "#1f9d55",
};

const STATUS_LABELS = { todo: "To Do", "in-progress": "In Progress", review: "In Review", done: "Done" };

export default function Reports() {
  const { user, ready, logout } = useSession();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [bugs, setBugs] = useState([]);

  useEffect(() => {
    if (!ready) return;
    setProjects(getProjects());
    setTasks(getAllTasks());
    setUsers(getUsers());
    setBugs(getAllBugs());
  }, [ready]);

  if (!ready) return null;

  const developers = users.filter((u) => u.role === "Developer");

  const projectChartData = projects.map((p) => {
    const pTasks = tasks.filter((t) => t.projectId === p.id);
    const done = pTasks.filter((t) => t.status === "done").length;
    const pct = pTasks.length ? Math.round((done / pTasks.length) * 100) : 0;
    return { name: p.name, completion: pct };
  });

  const statusPieData = Object.keys(STATUS_LABELS).map((key) => ({
    name: STATUS_LABELS[key],
    value: tasks.filter((t) => t.status === key).length,
    key,
  }));

  const bugStats = {
    open: bugs.filter((b) => b.status === "Open").length,
    inProgress: bugs.filter((b) => b.status === "In Progress").length,
    fixed: bugs.filter((b) => b.status === "Fixed").length,
  };

  return (
    <div className="app-shell">
      <Sidebar user={user} onLogout={logout} />
      <div className="main-col">
        <Topbar user={user} />
        <main className="content">
          <div className="page-header">
            <div>
              <h1>Reports</h1>
              <p>Progress by project and by developer.</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14, marginBottom: 16 }}>
            <div className="card">
              <h3 style={{ marginBottom: 12, fontSize: 15 }}>Project completion %</h3>
              {projectChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={projectChartData} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11.5 }} />
                    <YAxis tick={{ fontSize: 11.5 }} domain={[0, 100]} />
                    <Tooltip formatter={(v) => `${v}%`} contentStyle={{ fontSize: 13, borderRadius: 8 }} />
                    <Bar dataKey="completion" fill="#4b3fd6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="empty-state">No projects yet.</p>
              )}
            </div>

            <div className="card">
              <h3 style={{ marginBottom: 12, fontSize: 15 }}>Tasks by status</h3>
              {tasks.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={statusPieData} dataKey="value" nameKey="name" innerRadius={42} outerRadius={68} paddingAngle={2}>
                      {statusPieData.map((entry) => (
                        <Cell key={entry.key} fill={STATUS_COLORS[entry.key]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="empty-state">No tasks yet.</p>
              )}
            </div>
          </div>

          <div className="stat-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 16 }}>
            <div className="stat-card-color stat-rose">
              <div className="stat-value">{bugStats.open}</div>
              <div className="stat-label">Open bugs</div>
            </div>
            <div className="stat-card-color stat-amber">
              <div className="stat-value">{bugStats.inProgress}</div>
              <div className="stat-label">Bugs in progress</div>
            </div>
            <div className="stat-card-color stat-green">
              <div className="stat-value">{bugStats.fixed}</div>
              <div className="stat-label">Fixed bugs</div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ marginBottom: 12, fontSize: 15 }}>Project progress</h3>
            {projects.map((p) => {
              const pTasks = tasks.filter((t) => t.projectId === p.id);
              const done = pTasks.filter((t) => t.status === "done").length;
              const pct = pTasks.length ? Math.round((done / pTasks.length) * 100) : 0;
              return (
                <div className="bar-row" key={p.id}>
                  <div className="name">{p.name}</div>
                  <div className="bar-track"><div className="bar-fill" style={{ width: `${pct}%` }} /></div>
                  <div className="count">{pct}%</div>
                </div>
              );
            })}
            {projects.length === 0 && <p className="empty-state">No projects yet.</p>}
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 12, fontSize: 15 }}>Developer performance</h3>
            <table>
              <thead>
                <tr>
                  <th>Developer</th>
                  <th>Assigned</th>
                  <th>Done</th>
                  <th>Open bugs</th>
                  <th>Hours logged</th>
                </tr>
              </thead>
              <tbody>
                {developers.map((dev) => {
                  const mine = tasks.filter((t) => t.assignee === dev.id);
                  const done = mine.filter((t) => t.status === "done").length;
                  const devBugs = bugs.filter((b) => b.assignee === dev.id && b.status !== "Fixed").length;
                  const hours = mine.reduce((sum, t) => sum + (t.hoursLogged || 0), 0);
                  return (
                    <tr key={dev.id}>
                      <td>{dev.name}</td>
                      <td>{mine.length}</td>
                      <td>{done}</td>
                      <td>{devBugs}</td>
                      <td>{hours}</td>
                    </tr>
                  );
                })}
                {developers.length === 0 && (
                  <tr><td colSpan={5} style={{ color: "var(--muted)" }}>No developers yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}