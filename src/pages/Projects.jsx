import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useSession } from "../lib/useSession";
import { getProjects, getTasksByProject } from "../lib/store";

export default function Projects() {
  const { user, ready, logout } = useSession();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (!ready) return;
    setProjects(getProjects());
  }, [ready]);

  if (!ready) return null;

  const canCreate = user.role === "Project Manager";

  return (
    <div className="app-shell">
      <Sidebar user={user} onLogout={logout} />
      <main className="content">
        <div className="page-header">
          <div>
            <h1>Projects</h1>
            <p>Every project your team is running.</p>
          </div>
          {canCreate && (
            <Link to="/projects/new" className="btn btn-primary">+ New project</Link>
          )}
        </div>

        {projects.length === 0 && <p className="empty-state">No projects yet. Create one to get started.</p>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
          {projects.map((p) => {
            const tasks = getTasksByProject(p.id);
            const done = tasks.filter((t) => t.status === "done").length;
            return (
              <Link key={p.id} to={`/projects/${p.id}`} className="card" style={{ display: "block" }}>
                <h3 style={{ fontSize: 15.5 }}>{p.name}</h3>
                <p style={{ color: "var(--muted)", fontSize: 13, margin: "6px 0 12px" }}>{p.description}</p>
                <span style={{ fontSize: 12.5, color: "var(--muted)" }}>
                  {tasks.length} tasks &middot; {done} done
                </span>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
