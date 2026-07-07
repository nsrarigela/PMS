import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useSession } from "../lib/useSession";
import { getProject, getBugsByProject, getUsers, addBug, updateBug } from "../lib/store";

const STATUS_FLOW = ["Open", "In Progress", "Fixed"];

export default function Bugs() {
  const { id } = useParams();
  const { user, ready, logout } = useSession();

  const [project, setProject] = useState(null);
  const [bugs, setBugs] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const isPM = user?.role === "Project Manager";

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

  const projectMembers = users.filter((u) => project.members?.includes(u.id));
  const userName = (uid) => users.find((u) => u.id === uid)?.name || "Unassigned";

  const visibleBugs = isPM ? bugs : bugs.filter((b) => b.assignee === user.id);
  const filteredBugs = statusFilter === "all" ? visibleBugs : visibleBugs.filter((b) => b.status === statusFilter);

  function canEditBug(bug) {
    return isPM || bug.assignee === user.id;
  }

  function advanceStatus(bug) {
    const idx = STATUS_FLOW.indexOf(bug.status);
    if (idx === -1 || idx >= STATUS_FLOW.length - 1) return;
    updateBug(bug.id, { status: STATUS_FLOW[idx + 1] });
    refresh();
  }

  function setStatus(bug, status) {
    updateBug(bug.id, { status });
    refresh();
  }

  const counts = {
    Open: bugs.filter((b) => b.status === "Open").length,
    "In Progress": bugs.filter((b) => b.status === "In Progress").length,
    Fixed: bugs.filter((b) => b.status === "Fixed").length,
  };

  return (
    <div className="app-shell">
      <Sidebar user={user} onLogout={logout} />
      <div className="main-col">
        <Topbar user={user} />
        <main className="content">
          <div className="page-header">
            <div>
              <h1>{project.name} &middot; Bugs</h1>
              <p>Track and resolve defects for this project.</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Link to={`/projects/${id}`} className="btn">Back to board</Link>
              <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
                {showForm ? "Close" : "+ Report bug"}
              </button>
            </div>
          </div>

          <div className="stat-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 16 }}>
            <div className="stat-card-color stat-rose">
              <div className="stat-value">{counts.Open}</div>
              <div className="stat-label">Open</div>
            </div>
            <div className="stat-card-color stat-amber">
              <div className="stat-value">{counts["In Progress"]}</div>
              <div className="stat-label">In progress</div>
            </div>
            <div className="stat-card-color stat-green">
              <div className="stat-value">{counts.Fixed}</div>
              <div className="stat-label">Fixed</div>
            </div>
          </div>

          {showForm && (
            <NewBugForm
              projectId={id}
              users={projectMembers}
              onCreated={() => { setShowForm(false); refresh(); }}
            />
          )}

          <div className="card" style={{ marginBottom: 16 }}>
            <div className="field" style={{ marginBottom: 0, maxWidth: 220 }}>
              <label>Filter by status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Fixed">Fixed</option>
              </select>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 12, fontSize: 15 }}>
              {filteredBugs.length} bug{filteredBugs.length !== 1 ? "s" : ""}
            </h3>
            {filteredBugs.length === 0 ? (
              <p className="empty-state">No bugs match this filter.</p>
            ) : (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Assignee</th>
                      <th>Reported</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBugs.map((b) => (
                      <tr key={b.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{b.title}</div>
                          {b.description && (
                            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{b.description}</div>
                          )}
                        </td>
                        <td><span className={`badge badge-${b.priority}`}>{b.priority}</span></td>
                        <td>
                          <span
                            className={`badge ${
                              b.status === "Fixed" ? "badge-done" : b.status === "In Progress" ? "badge-in-progress" : "badge-high"
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td style={{ fontSize: 12.5 }}>{userName(b.assignee)}</td>
                        <td style={{ fontSize: 12.5, color: "var(--muted)" }}>
                          {new Date(b.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td>
                          {canEditBug(b) && b.status !== "Fixed" ? (
                            <div style={{ display: "flex", gap: 6 }}>
                              <button
                                className="btn"
                                style={{ padding: "4px 10px", fontSize: 12 }}
                                onClick={() => advanceStatus(b)}
                              >
                                {b.status === "Open" ? "Start work" : "Mark fixed"}
                              </button>
                              {b.status !== "Open" && (
                                <button
                                  className="btn"
                                  style={{ padding: "4px 10px", fontSize: 12 }}
                                  onClick={() => setStatus(b, "Open")}
                                >
                                  Reopen
                                </button>
                              )}
                            </div>
                          ) : canEditBug(b) && b.status === "Fixed" ? (
                            <button
                              className="btn"
                              style={{ padding: "4px 10px", fontSize: 12 }}
                              onClick={() => setStatus(b, "Open")}
                            >
                              Reopen
                            </button>
                          ) : (
                            <span style={{ fontSize: 12, color: "var(--muted)" }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
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

    addBug({
      projectId,
      title: title.trim(),
      description: description.trim(),
      priority,
      assignee,
    });

    onCreated();
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ marginBottom: 20 }}>
      <h3 style={{ marginBottom: 16 }}>Report a bug</h3>

      <div className="field">
        <label>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Login button unresponsive on mobile" />
      </div>

      <div className="field">
        <label>Description</label>
        <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Steps to reproduce, expected vs actual behavior..." />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="field">
          <label>Priority</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="field">
          <label>Assign to</label>
          <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
            {users.length === 0 && <option value="">No team members</option>}
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
      </div>

      <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>Report bug</button>
    </form>
  );
}