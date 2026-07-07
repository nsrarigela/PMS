import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FolderKanban, ListChecks, Users, CheckCircle2, Clock, AlertTriangle, MoreHorizontal } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useSession } from "../lib/useSession";
import { getProjects, getAllTasks, getUsers, updateTask } from "../lib/store";
import { getUpcomingHolidays } from "../lib/holidays";

const STATUS_LABELS = { todo: "To Do", "in-progress": "In Progress", review: "In Review", done: "Done" };
const STATUS_OPTIONS = ["all", "todo", "in-progress", "review", "done"];
const PRIORITY_OPTIONS = ["all", "high", "medium", "low"];
const SORT_OPTIONS = [
  { value: "dueDate", label: "Due date" },
  { value: "priority", label: "Priority" },
  { value: "createdAt", label: "Created date" },
];
const PRIORITY_WEIGHT = { high: 0, medium: 1, low: 2 };

function isToday(timestamp) {
  if (!timestamp) return false;
  const d = new Date(timestamp);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

function isOverdue(task) {
  if (!task.dueDate || task.status === "done") return false;
  return new Date(task.dueDate) < new Date(new Date().toDateString());
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr) - new Date(new Date().toDateString())) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function Dashboard() {
  const { user, ready, logout } = useSession();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
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

    const allProjects = getProjects();
    const allTasks = getAllTasks();
    const allUsers = getUsers();

    if (user?.role === "Project Manager") {
      setProjects(allProjects);
      setTasks(allTasks);
    } else {
      const myTasks = allTasks.filter((t) => t.assignee === user.id);
      const myProjectIds = [...new Set(myTasks.map((t) => t.projectId))];
      const myProjects = allProjects.filter((p) => myProjectIds.includes(p.id));
      setProjects(myProjects);
      setTasks(myTasks);
    }

    setUsers(allUsers);
  }, [ready, user]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const developers =
    user?.role === "Project Manager"
      ? users.filter((u) => u.role === "Developer")
        : user ? [user] : [];
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const pendingCount = tasks.filter((t) => t.status !== "done").length;
  const openBugs = tasks.filter((t) => t.type === "bug" && t.status !== "done").length;
  const completion = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

  const completedToday = tasks.filter((t) => t.status === "done" && isToday(t.createdAt)).length;

  const byStatus = Object.keys(STATUS_LABELS).map((key) => ({
    key,
    label: STATUS_LABELS[key],
    count: tasks.filter((t) => t.status === key).length,
  }));
  const maxCount = Math.max(1, ...byStatus.map((s) => s.count));

  function projectName(id) {
    return projects.find((p) => p.id === id)?.name || "Unknown project";
  }
  function userName(id) {
    return users.find((u) => u.id === id)?.name || "Unassigned";
  }

  function changeStatus(task, newStatus) {
    updateTask(task.id, { status: newStatus });
    setTasks(getAllTasks());
    setOpenMenuId(null);
  }

  const boardTasks = useMemo(() => {
    let list = [...tasks];

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
    if (user?.role === "Project Manager" && assigneeFilter !== "all") {
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
  }, [tasks, search, statusFilter, priorityFilter, assigneeFilter, dueFilter, sortBy, user?.role]);

  const isPM = user?.role === "Project Manager";
  const nextHoliday = getUpcomingHolidays(1)[0];

  if (!ready || !user) {
    return null;
  }

  return (
    <div className="app-shell">
      <Sidebar user={user} onLogout={logout} />
      <div className="main-col">
        <Topbar user={user} />
        <main className="content">
          <div className="page-header">
            {user.role === "Developer" && (
              <div className="stat-grid" style={{ marginBottom: 20 }}>
                <div className="stat-card-color stat-blue">
                  <div className="stat-value">{tasks.length}</div>
                  <div className="stat-label">Assigned Tasks</div>
                </div>
                <div className="stat-card-color stat-green">
                  <div className="stat-value">
                    {tasks.filter((t) => t.status === "done").length}
                  </div>
                  <div className="stat-label">Completed</div>
                </div>
                <div className="stat-card-color stat-amber">
                  <div className="stat-value">
                    {tasks.filter((t) => t.status !== "done").length}
                  </div>
                  <div className="stat-label">Pending</div>
                </div>
                <div className="stat-card-color stat-purple">
                  <div className="stat-value">
                    {tasks.length
                      ? Math.round(
                          (tasks.filter((t) => t.status === "done").length /
                            tasks.length) *
                            100
                        )
                      : 0}
                    %
                  </div>
                  <div className="stat-label">Completion</div>
                </div>
              </div>
            )}
            <div>
              <h1>Welcome back, <span className="accent-text">{user.name.split(" ")[0]}</span></h1>
              <p>Your workspace is ready &middot; {user.role}</p>
            </div>
          </div>

          {nextHoliday && (
            <div className="card announcement-card" style={{ marginBottom: 18 }}>
              <div className="announcement-header">
                <div className="announcement-title">
                  <span className="announcement-icon">📢</span>
                  Company Announcements
                </div>
              </div>
              <div className={`announcement-item ${nextHoliday.type === "national" ? "announcement-national" : "announcement-festival"}`}>
                <div className="announcement-item-title">
                  🎉 {nextHoliday.name} (in {nextHoliday.daysUntil} day{nextHoliday.daysUntil !== 1 ? "s" : ""})
                </div>
                <div className="announcement-item-date">
                  {new Date(nextHoliday.date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                </div>
                <p className="announcement-item-body">
                  {nextHoliday.type === "national"
                    ? `${nextHoliday.name} is a national holiday. Office will be closed.`
                    : `${nextHoliday.name} is coming up. Plan your tasks accordingly.`}
                </p>
              </div>
            </div>
          )}

          <div className="stat-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            <Link to="/projects" className="stat-card-color stat-purple">
              <div className="stat-card-top">
                <div className="stat-icon-badge stat-icon-purple"><FolderKanban size={18} /></div>
              </div>
              <div className="stat-value">{projects.length}</div>
              <div className="stat-label">
                {user.role === "Project Manager" ? "Total Projects" : "My Projects"}
              </div>
            </Link>
            <Link to="/my-tasks" className="stat-card-color stat-blue">
              <div className="stat-card-top">
                <div className="stat-icon-badge stat-icon-blue"><ListChecks size={18} /></div>
              </div>
              <div className="stat-value">{tasks.length}</div>
              <div className="stat-label">Total tasks</div>
            </Link>

            {isPM ? (
              <Link to="/users" className="stat-card-color stat-teal">
                <div className="stat-card-top">
                  <div className="stat-icon-badge stat-icon-teal"><Users size={18} /></div>
                </div>
                <div className="stat-value">{developers.length}</div>
                <div className="stat-label">Developers</div>
              </Link>
            ) : (
              <div className="stat-card-color stat-teal">
                <div className="stat-card-top">
                  <div className="stat-icon-badge stat-icon-teal"><Users size={18} /></div>
                </div>
                <div className="stat-value">{developers.length}</div>
                <div className="stat-label">Developers</div>
              </div>
            )}

            <Link to="/my-tasks?status=done" className="stat-card-color stat-green">
              <div className="stat-card-top">
                <div className="stat-icon-badge stat-icon-green"><CheckCircle2 size={18} /></div>
              </div>
              <div className="stat-value">{doneCount}</div>
              <div className="stat-label">Completed tasks</div>
            </Link>
            <Link to="/my-tasks" className="stat-card-color stat-amber">
              <div className="stat-card-top">
                <div className="stat-icon-badge stat-icon-amber"><Clock size={18} /></div>
              </div>
              <div className="stat-value">{pendingCount}</div>
              <div className="stat-label">Pending tasks</div>
            </Link>

            <Link to="/my-tasks" className="stat-card-color stat-rose">
              <div className="stat-card-top">
                <div className="stat-icon-badge stat-icon-rose"><AlertTriangle size={18} /></div>
              </div>
              <div className="stat-value">{openBugs}</div>
              <div className="stat-label">Open bugs</div>
            </Link>
          </div>

          {user.role === "Project Manager" && (
            <div className="card" style={{ marginBottom: 18 }}>
              <h3 style={{ marginBottom: 15 }}>Developer Performance</h3>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Developer</th>
                      <th>Assigned</th>
                      <th>Completed</th>
                      <th>In Progress</th>
                      <th>Pending</th>
                      <th>Completion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {developers.map((dev) => {
                      const mine = tasks.filter((t) => t.assignee === dev.id);
                      const completed = mine.filter((t) => t.status === "done").length;
                      const progress = mine.filter((t) => t.status === "in-progress").length;
                      const pending = mine.filter((t) => t.status === "todo").length;
                      const devCompletion = mine.length > 0 ? Math.round((completed / mine.length) * 100) : 0;

                      return (
                        <tr key={dev.id}>
                          <td>{dev.name}</td>
                          <td>{mine.length}</td>
                          <td>{completed}</td>
                          <td>{progress}</td>
                          <td>{pending}</td>
                          <td>{devCompletion}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: isPM ? "2fr 1fr 1fr 1fr 1fr 1fr" : "2fr 1fr 1fr 1fr 1fr", gap: 10 }}>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Search by title</label>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks..." />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Status</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s === "all" ? "All statuses" : STATUS_LABELS[s]}</option>
                  ))}
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

          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ marginBottom: 12, fontSize: 15 }}>
              {boardTasks.length} task{boardTasks.length !== 1 ? "s" : ""}
            </h3>
            {boardTasks.length === 0 ? (
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
                    {boardTasks.map((t) => {
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

          <div className="card" style={{ marginBottom: 16, marginTop: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <h3 style={{ fontSize: 15 }}>
                {user.role === "Project Manager" ? "Team Progress" : "My Progress"}
              </h3>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>
                {user.role === "Project Manager"
                  ? `${completedToday} task(s) completed today`
                  : `${doneCount} task(s) completed`}
              </span>
            </div>
            <div className="bar-track" style={{ height: 12 }}>
              <div className="bar-fill" style={{ width: `${completion}%` }} />
            </div>
            <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 8 }}>
              {user.role === "Project Manager"
                ? `${completion}% of all tasks completed overall`
                : `${completion}% of my assigned tasks completed`}
            </p>
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
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
            <h3 style={{ marginBottom: 12, fontSize: 15 }}>
              {user.role === "Project Manager" ? "All Projects" : "My Projects"}
            </h3>
            {projects.length === 0 && <p className="empty-state">No projects yet.</p>}
            {projects.map((p) => (
              <Link key={p.id} to={`/projects/${p.id}`} className="project-row">
                {p.name}
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}