import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ListFilter, List, LayoutGrid, Search } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useSession } from "../lib/useSession";
import { getAllTasks, getProjects, getUsers, updateTask } from "../lib/store";

const STATUSES = ["todo", "in-progress", "review", "done"];
const STATUS_LABELS = { todo: "To Do", "in-progress": "In Progress", review: "In Review", done: "Done" };

export default function MyTasks() {
  const { user, ready, logout } = useSession();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [view, setView] = useState("list");
  const [search, setSearch] = useState("");
  const [searchParams] = useSearchParams();
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  function refresh() {
    setTasks(getAllTasks());
    setProjects(getProjects());
    setUsers(getUsers());
  }

  useEffect(() => {
    if (!ready) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  if (!ready) return null;

  const isPM = user.role === "Project Manager";
  const projectName = (id) => projects.find((p) => p.id === id)?.name || "—";
  const userName = (id) => users.find((u) => u.id === id)?.name || "Unassigned";

  const scoped = isPM ? tasks : tasks.filter((t) => t.assignee === user.id);

  const filtered = scoped.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (projectFilter !== "all" && t.projectId !== projectFilter) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    return true;
  });

  function moveTask(task, newStatus) {
    updateTask(task.id, { status: newStatus });
    refresh();
  }

  return (
    <div className="app-shell">
      <Sidebar user={user} onLogout={logout} />
      <div className="main-col">
        <Topbar user={user} />
        <main className="content">
          <div className="page-header">
            <div>
              <h1>My Tasks</h1>
              <p>{isPM ? "Every task across all projects." : "Everything assigned to you, in one place."}</p>
            </div>
            <span className="badge badge-task">{filtered.length} task{filtered.length !== 1 ? "s" : ""}</span>
          </div>

          <div className="card mytasks-filterbar">
            <div className="mytasks-filterbar-title">
              <ListFilter size={15} />
              <span>Filters &amp; search</span>
            </div>
            <div className="mytasks-filter-row">
              <div className="topbar-search" style={{ flex: 1, background: "var(--bg)" }}>
                <Search size={15} />
                <input placeholder="Search by title..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} style={{ width: 170 }}>
                <option value="all">All projects</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: 150 }}>
                <option value="all">All statuses</option>
                {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} style={{ width: 140 }}>
                <option value="all">All priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="view-toggle">
            <button className={view === "list" ? "active" : ""} onClick={() => setView("list")}>
              <List size={15} /> List view
            </button>
            <button className={view === "kanban" ? "active" : ""} onClick={() => setView("kanban")}>
              <LayoutGrid size={15} /> Kanban view
            </button>
          </div>

          {view === "list" ? (
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <table>
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Project</th>
                    <th>Status</th>
                    <th>Priority</th>
                    {isPM && <th>Assignee</th>}
                    <th>Due date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <Link to={`/projects/${t.projectId}`} style={{ fontWeight: 600, color: "var(--text)" }}>
                          {t.title}
                        </Link>
                      </td>
                      <td style={{ fontSize: 12.5, color: "var(--muted)" }}>{projectName(t.projectId)}</td>
                      <td><span className={`badge badge-${t.status}`}>{STATUS_LABELS[t.status]}</span></td>
                      <td><span className={`badge badge-${t.priority}`}>{t.priority}</span></td>
                      {isPM && <td style={{ fontSize: 13 }}>{userName(t.assignee)}</td>}
                      <td style={{ fontSize: 12.5, color: "var(--muted)" }}>{t.dueDate || "—"}</td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={isPM ? 6 : 5} style={{ color: "var(--muted)", textAlign: "center", padding: 30 }}>No tasks match your filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="board">
              {STATUSES.map((s) => {
                const colTasks = filtered.filter((t) => t.status === s);
                return (
                  <div className="board-col" key={s}>
                    <div className="board-col-title"><span>{STATUS_LABELS[s]}</span><span>{colTasks.length}</span></div>
                    {colTasks.map((t) => (
                      <div className="task-card" key={t.id}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span className="task-key">{t.key}</span>
                          <span className={`badge badge-${t.type}`}>{t.type}</span>
                        </div>
                        <Link to={`/projects/${t.projectId}`} className="task-card-title" style={{ display: "block" }}>{t.title}</Link>
                        <div className="task-card-footer">
                          <span className={`badge badge-${t.priority}`}>{t.priority}</span>
                        </div>
                        <div className="move-btns" style={{ marginTop: 8 }}>
                          <button disabled={STATUSES.indexOf(s) <= 0} onClick={() => moveTask(t, STATUSES[STATUSES.indexOf(s) - 1])}>&larr;</button>
                          <button disabled={STATUSES.indexOf(s) >= STATUSES.length - 1} onClick={() => moveTask(t, STATUSES[STATUSES.indexOf(s) + 1])}>&rarr;</button>
                        </div>
                      </div>
                    ))}
                    {colTasks.length === 0 && <p style={{ fontSize: 12, color: "var(--muted)", padding: "0 6px" }}>No tasks</p>}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}