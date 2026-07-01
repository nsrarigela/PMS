import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useSession } from "../lib/useSession";
import { getProjects, getAllTasks, getUsers } from "../lib/store";

export default function Reports() {
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

  return (
    <div className="app-shell">
      <Sidebar user={user} onLogout={logout} />
      <main className="content">
        <div className="page-header">
          <div>
            <h1>Reports</h1>
            <p>Progress by project and by developer.</p>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 14, fontSize: 15 }}>Project progress</h3>
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
          <h3 style={{ marginBottom: 14, fontSize: 15 }}>Developer workload</h3>
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
                const bugs = mine.filter((t) => t.type === "bug" && t.status !== "done").length;
                const hours = mine.reduce((sum, t) => sum + (t.hoursLogged || 0), 0);
                return (
                  <tr key={dev.id}>
                    <td>{dev.name}</td>
                    <td>{mine.length}</td>
                    <td>{done}</td>
                    <td>{bugs}</td>
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
  );
}
