import { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useSession } from "../lib/useSession";
import { getAllTasks, getProjects, getUsers, updateTask } from "../lib/store";
import { MoreHorizontal } from "lucide-react";

const STATUS_OPTIONS = ["all", "todo", "in-progress", "review", "done"];
const STATUS_LABELS = { all: "All statuses", todo: "Todo", "in-progress": "In Progress", review: "Review", done: "Completed" };
const PRIORITY_OPTIONS = ["all", "high", "medium", "low"];
const SORT_OPTIONS = [
  { value: "dueDate", label: "Due date" },
  { value: "priority", label: "Priority" },
  { value: "createdAt", label: "Created date" },
];
const PRIORITY_WEIGHT = { high: 0, medium: 1, low: 2 };

function isOverdue(task) {
  if (!task.dueDate || task.status === "done") return false;
  return new Date(task.dueDate) < new Date(new Date().toDateString());
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr) - new Date(new Date().toDateString())) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function MyTasks() {
  const { user, ready, logout } = useSession();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [dueFilter, setDueFilter] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");

  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);

  useEffect(() => {
    if (!ready) return;
    setTasks(getAllTasks());
    setProjects(getProjects());
    setUsers(getUsers());
  }, [ready]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isPM = user?.role === "Project Manager";

  const baseTasks = useMemo(
    () => (isPM ? tasks : tasks.filter((t) => t.assignee === user?.id)),
    [tasks, isPM, user]
  );

  const filtered = useMemo(() => {
    let list = [...baseTasks];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((t) => t.title.toLowerCase().includes(q) || t.key.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") {
      list = list.filter((t) => t.status === statusFilter);
    }
    if (priorityFilter !== "all") {
      list = list.filter((t) => t.priority === priorityFilter);
    }
    if (isPM && assigneeFilter !== "all") {
      list = list.filter((t) => t.assignee === assigneeFilter);
    }
    if (dueFilter === "overdue") {
      list = list.filter((t) => isOverdue(t));
    } else if (dueFilter === "week") {
      list = list.filter((t) => {
        const d = daysUntil(t.dueDate);
        return d !== null && d >= 0 && d <= 7;
      });
    } else if (dueFilter === "none") {
      list = list.filter((t) => !t.dueDate);
    }

    list.sort((a, b) => {
      if (sortBy === "priority") {
        return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
      }
      if (sortBy === "createdAt") {
        return (b.createdAt || 0) - (a.createdAt || 0);
      }
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

    return list;
  }, [baseTasks, search, statusFilter, priorityFilter, assigneeFilter, dueFilter, sortBy, isPM]);

  const developers = useMemo(() => users.filter((u) => u.role === "Developer"), [users]);

  function changeStatus(task, newStatus) {
    updateTask(task.id, { status: newStatus });
    setTasks(getAllTasks());
    setOpenMenuId(null);
  }

  if (!ready) return null;

  function projectName(id) {
    return projects.find((p) => p.id === id)?.name || "Unknown project";
  }
  function userName(id) {
    return users.find((u) => u.id === id)?.name || "Unassigned";
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
              <p>{isPM ? "Every task across every project." : "Everything currently assigned to you."}</p>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: isPM ? "2fr 1fr 1fr 1fr 1fr 1fr" : "2fr 1fr 1fr 1fr 1fr", gap: 10 }}>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Search by title</label>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks..." />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Status</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Priority</label>
                <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                  {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p === "all" ? "All priorities" : p}</option>)}
                </select>
              </div>
              {isPM && (
                <div className="field" style={{ marginBottom: 0 }}>
                  <label>Assignee</label>
                  <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)}>
                    <option value="all">All assignees</option>
                    {developers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              )}
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Due date</label>
                <select value={dueFilter} onChange={(e) => setDueFilter(e.target.value)}>
                  <option value="all">All</option>
                  <option value="overdue">Overdue</option>
                  <option value="week">Due within 7 days</option>
                  <option value="none">No due date</option>
                </select>
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Sort by</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 12, fontSize: 15 }}>{filtered.length} task{filtered.length !== 1 ? "s" : ""}</h3>
            {filtered.length === 0 ? (
              <p className="empty-state">No tasks match your filters.</p>
            ) : (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Task</th>
                      <th>Project</th>
                      <th>Status</th>
                      <th>Priority</th>
                      {isPM && <th>Assignee</th>}
                      <th>Due date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((t) => {
                      const overdue = isOverdue(t);
                      const d = daysUntil(t.dueDate);
                      const menuOpen = openMenuId === t.id;

                      return (
                        <tr key={t.id}>
                          <td>
                            <span className="task-key" style={{ marginRight: 8 }}>{t.key}</span>
                            {t.title}
                          </td>
                          <td style={{ fontSize: 12.5, color: "var(--muted)" }}>{projectName(t.projectId)}</td>
                          <td><span className={`badge badge-${t.status}`}>{STATUS_LABELS[t.status]}</span></td>
                          <td><span className={`badge badge-${t.priority}`}>{t.priority}</span></td>
                          {isPM && <td style={{ fontSize: 12.5 }}>{userName(t.assignee)}</td>}
                          <td>
                            {t.dueDate ? (
                              <span style={{ fontSize: 12.5, color: overdue ? "var(--danger)" : "var(--muted)", fontWeight: overdue ? 600 : 400 }}>
                                {t.dueDate}{overdue ? " (overdue)" : d !== null && d <= 7 && d >= 0 ? ` (${d}d left)` : ""}
                              </span>
                            ) : (
                              <span style={{ fontSize: 12.5, color: "var(--muted)" }}>—</span>
                            )}
                          </td>
                          <td className="actions-cell" ref={menuOpen ? menuRef : null}>
                            <button
                              className="actions-trigger"
                              onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setMenuPos({ top: rect.bottom + 6, left: rect.right - 190 });
                                setOpenMenuId(menuOpen ? null : t.id);
                              }}
                            >
                              <MoreHorizontal size={16} />
                            </button>

                            {menuOpen && (
                              <div className="actions-menu" style={{ top: menuPos.top, left: menuPos.left }}>
                                <div className="actions-menu-label">Quick status</div>
                                {STATUS_OPTIONS.filter((s) => s !== "all").map((s) =>
                                  s === t.status ? (
                                    <span key={s} className="actions-menu-item current">{STATUS_LABELS[s]}</span>
                                  ) : (
                                    <button
                                      key={s}
                                      className="actions-menu-item"
                                      onClick={() => changeStatus(t, s)}
                                    >
                                      {STATUS_LABELS[s]}
                                    </button>
                                  )
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
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