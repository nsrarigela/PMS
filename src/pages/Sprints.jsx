import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useSession } from "../lib/useSession";
import {
  getProject,
  getSprintsByProject,
  getTasksBySprint,
  getTasksByProject,
  addSprint,
  deleteSprint,
} from "../lib/store";

export default function Sprints() {
  const { id } = useParams();
  const { user, ready, logout } = useSession();

  const [project, setProject] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);

  function refresh() {
    setProject(getProject(id));
    setSprints(getSprintsByProject(id));
    setAllTasks(getTasksByProject(id));
  }

  useEffect(() => {
    if (!ready) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, id]);

  if (!ready || !project) return null;

  const isPM = user.role === "Project Manager";
  const unassignedCount = allTasks.filter((t) => !t.sprintId).length;

  function handleDelete(sprintId) {
    if (!window.confirm("Delete this sprint? Its tasks will move back to Backlog.")) return;
    deleteSprint(sprintId);
    refresh();
  }

  return (
    <div className="app-shell">
      <Sidebar user={user} onLogout={logout} />
      <main className="content">
        <div className="page-header">
          <div>
            <h1>{project.name} &middot; Sprints</h1>
            <p>Short development cycles for this project.</p>
         {isPM && (
  <Link
    to={`/projects/${id}/edit`}
    className="btn btn-primary"
  >
    Edit Project
  </Link>
)}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link to={`/projects/${id}`} className="btn">Back to board</Link>
            {isPM && (
              <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
                {showForm ? "Close" : "+ New sprint"}
              </button>
            )}
          </div>
        </div>

        {showForm && (
          <NewSprintForm projectId={id} onCreated={() => { setShowForm(false); refresh(); }} />
        )}

        {sprints.length === 0 && <p className="empty-state">No sprints yet. Create one to start planning.</p>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
          {sprints.map((s) => {
            const sTasks = getTasksBySprint(s.id);
            const done = sTasks.filter((t) => t.status === "done").length;
            const pct = sTasks.length ? Math.round((done / sTasks.length) * 100) : 0;
            return (
              <div className="card" key={s.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <h3 style={{ fontSize: 15.5 }}>{s.name}</h3>
                  {isPM && (
                    <button className="btn btn-danger" style={{ padding: "4px 9px", fontSize: 12 }} onClick={() => handleDelete(s.id)}>
                      Delete
                    </button>
                  )}
                </div>
                <p style={{ color: "var(--muted)", fontSize: 12.5, margin: "4px 0 12px" }}>
                  {s.startDate || "No start"} &rarr; {s.endDate || "No end"}
                </p>

                <div className="bar-row" style={{ marginBottom: 12 }}>
                  <div className="bar-track"><div className="bar-fill" style={{ width: `${pct}%` }} /></div>
                  <div className="count">{pct}%</div>
                </div>

                {sTasks.length === 0 && <p style={{ fontSize: 12.5, color: "var(--muted)" }}>No tasks assigned yet.</p>}
                {sTasks.map((t) => (
                  <div key={t.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, borderTop: "1px solid var(--border)" }}>
                    <span>{t.title}</span>
                    <span className={`badge badge-${t.status}`}>{t.status}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {unassignedCount > 0 && (
          <p style={{ marginTop: 20, fontSize: 13, color: "var(--muted)" }}>
            {unassignedCount} task(s) not yet assigned to a sprint — assign them from the{" "}
            <Link to={`/projects/${id}`} style={{ color: "var(--accent)", fontWeight: 600 }}>Kanban board</Link>.
          </p>
        )}
      </main>
    </div>
  );
}

function NewSprintForm({ projectId, onCreated }) {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    addSprint({ projectId, name: name.trim(), startDate, endDate });
    onCreated();
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ marginBottom: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12 }}>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Sprint name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Sprint 2" />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Start date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>End date</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>
      <button type="submit" className="btn btn-primary" style={{ marginTop: 12 }}>Create sprint</button>
    </form>
  );
}