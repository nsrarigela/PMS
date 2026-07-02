import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useSession } from "../lib/useSession";
import { getProject, getBugsByProject, getUsers, addBug, updateBug } from "../lib/store";

const STATUSES = ["Open", "In Progress", "Fixed"];

export default function Bugs() {
  const { id } = useParams();
  const { user, ready, logout } = useSession();

  const [project, setProject] = useState(null);
  const [bugs, setBugs] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);

  function refresh() {
    setProject(getProject(id));
    setBugs(getBugsByProject(id));
    setUsers(getUsers());
  }

  useEffect(() => {
    if (!ready) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, id]);

  if (!ready || !project) return null;

  const isPM = user.role === "Project Manager";
  const userName = (uid) => users.find((u) => u.id === uid)?.name || "Unassigned";

  function handleStatusChange(bugId, status) {
    updateBug(bugId, { status });
    refresh();
  }

  const statusClass = { Open: "badge-high", "In Progress": "badge-in-progress", Fixed: "badge-done" };

  return (
    <div className="app-shell">
      <Sidebar user={user} onLogout={logout} />
      <main className="content">
        <div className="page-header">
          <div>
            <h1>{project.name} &middot; Bugs</h1>
            <p>Track and resolve reported issues.</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link to={`/projects/${id}`} className="btn">Back to board</Link>
            <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
              {showForm ? "Close" : "+ Report bug"}
            </button>
          </div>
        </div>

        {showForm && (
          <NewBugForm projectId={id} users={users} onCreated={() => { setShowForm(false); refresh(); }} />
        )}

        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Bug</th>
                <th>Priority</th>
                <th>Assignee</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bugs.map((b) => {
                const canEdit = isPM || b.assignee === user.id;
                return (
                  <tr key={b.id}>
                    <td>
                      <strong style={{ fontSize: 13.5 }}>{b.title}</strong>
                      {b.description && <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--muted)" }}>{b.description}</p>}
                    </td>
                    <td><span className={`badge badge-${b.priority}`}>{b.priority}</span></td>
                    <td style={{ fontSize: 13 }}>{userName(b.assignee)}</td>
                    <td>
                      {canEdit ? (
                        <select
                          value={b.status}
                          onChange={(e) => handleStatusChange(b.id, e.target.value)}
                          style={{ width: "auto", padding: "5px 8px", fontSize: 12.5 }}
                        >
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      ) : (
                        <span className={`badge ${statusClass[b.status]}`}>{b.status}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {bugs.length === 0 && (
                <tr><td colSpan={4} style={{ color: "var(--muted)" }}>No bugs reported yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

function NewBugForm({ projectId, users, onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assignee, setAssignee] = useState(users[0]?.id || "");

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    addBug({ projectId, title: title.trim(), description: description.trim(), priority, assignee });
    onCreated();
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ marginBottom: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12 }}>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Bug title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Login button not working" />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Priority</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Assignee</label>
          <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
      </div>
      <div className="field" style={{ marginTop: 12 }}>
        <label>Description</label>
        <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Steps to reproduce..." />
      </div>
      <button type="submit" className="btn btn-primary">Report bug</button>
    </form>
  );
}