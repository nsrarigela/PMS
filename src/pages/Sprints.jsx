import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useSession } from "../lib/useSession";
import {
  getProject,
  getSprintsByProject,
  getTasksBySprint,
  getTasksByProject,
  addSprint,
  deleteSprint,
} from "../lib/store";

function getBurndownData(sprint, tasks) {
  if (!sprint?.startDate || !sprint?.endDate) return null;

  const start = new Date(sprint.startDate);
  const end = new Date(sprint.endDate);
  if (isNaN(start) || isNaN(end) || end <= start) return null;

  const totalDays = Math.max(1, Math.round((end - start) / 86400000));
  const total = tasks.length;
  const today = new Date(new Date().toDateString());

  const data = [];
  for (let i = 0; i <= totalDays; i++) {
    const day = new Date(start.getTime() + i * 86400000);
    const ideal = Math.max(0, total - (total / totalDays) * i);

    let actual = null;
    if (day <= today) {
      const completedByDay = tasks.filter(
        (t) => t.completedAt && new Date(t.completedAt) <= day
      ).length;
      actual = total - completedByDay;
    }

    data.push({
      label: day.toLocaleDateString([], { month: "short", day: "numeric" }),
      ideal: Math.round(ideal * 10) / 10,
      actual,
    });
  }
  return data;
}

export default function Sprints() {
  const { id } = useParams();
  const { user, ready, logout } = useSession();

  const [project, setProject] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedSprintId, setSelectedSprintId] = useState(null);

  function refresh() {
    setProject(getProject(id));
    const s = getSprintsByProject(id);
    setSprints(s);
    setAllTasks(getTasksByProject(id));
    if (s.length > 0 && !selectedSprintId) {
      setSelectedSprintId(s[0].id);
    }
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
    if (selectedSprintId === sprintId) setSelectedSprintId(null);
    refresh();
  }

  const selectedSprint = sprints.find((s) => s.id === selectedSprintId) || null;
  const selectedSprintTasks = selectedSprint ? getTasksBySprint(selectedSprint.id) : [];
  const burndownData = selectedSprint ? getBurndownData(selectedSprint, selectedSprintTasks) : null;

  return (
    <div className="app-shell">
      <Sidebar user={user} onLogout={logout} />
      <div className="main-col">
        <Topbar user={user} />
        <main className="content">
          <div className="page-header">
            <div>
              <h1>{project.name} &middot; Sprints</h1>
              <p>Short development cycles for this project.</p>
              {isPM && (
                <Link
                  to={`/projects/${id}/edit`}
                  className="btn btn-primary"
                  style={{ marginTop: 10, display: "inline-flex" }}
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

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 20 }}>
            {sprints.map((s) => {
              const sTasks = getTasksBySprint(s.id);
              const done = sTasks.filter((t) => t.status === "done").length;
              const pct = sTasks.length ? Math.round((done / sTasks.length) * 100) : 0;
              const isSelected = selectedSprintId === s.id;
              return (
                <div
                  className="card"
                  key={s.id}
                  style={{
                    cursor: "pointer",
                    border: isSelected ? "2px solid var(--accent)" : undefined,
                  }}
                  onClick={() => setSelectedSprintId(s.id)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <h3 style={{ fontSize: 15.5 }}>{s.name}</h3>
                    {isPM && (
                      <button
                        className="btn btn-danger"
                        style={{ padding: "4px 9px", fontSize: 12 }}
                        onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }}
                      >
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

          {sprints.length > 0 && (
            <div className="card" style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h3 style={{ fontSize: 15 }}>Sprint burndown</h3>
                <select
                  value={selectedSprintId || ""}
                  onChange={(e) => setSelectedSprintId(e.target.value)}
                  style={{ width: 220 }}
                >
                  {sprints.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {!selectedSprint ? (
                <p className="empty-state">Select a sprint to view its burndown.</p>
              ) : selectedSprintTasks.length === 0 ? (
                <p className="empty-state">This sprint has no tasks yet.</p>
              ) : !burndownData ? (
                <p className="empty-state">
                  This sprint needs both a start date and an end date to show a burndown chart.
                </p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={burndownData} margin={{ top: 4, right: 12, left: -12, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="label" tick={{ fontSize: 11.5 }} />
                      <YAxis tick={{ fontSize: 11.5 }} allowDecimals={false} />
                      <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8 }} />
                      <Legend wrapperStyle={{ fontSize: 12.5 }} />
                      <Line
                        type="monotone"
                        dataKey="ideal"
                        name="Ideal"
                        stroke="var(--muted)"
                        strokeDasharray="5 4"
                        dot={false}
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        name="Actual remaining"
                        stroke="var(--accent)"
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 10 }}>
                    Ideal line assumes tasks finish at a constant rate across the sprint. Actual line reflects tasks whose completion was recorded after this feature was added — tasks completed earlier won't appear on past dates.
                  </p>
                </>
              )}
            </div>
          )}

          {unassignedCount > 0 && (
            <p style={{ marginTop: 4, fontSize: 13, color: "var(--muted)" }}>
              {unassignedCount} task(s) not yet assigned to a sprint — assign them from the{" "}
              <Link to={`/projects/${id}`} style={{ color: "var(--accent)", fontWeight: 600 }}>Kanban board</Link>.
            </p>
          )}
        </main>
      </div>
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