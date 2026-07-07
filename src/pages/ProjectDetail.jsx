import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors, useDroppable } from "@dnd-kit/core";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import TaskCard from "../components/TaskCard";
import { useSession } from "../lib/useSession";
import { getProject, getTasksByProject, getUsers, addTask, updateTask, addNotification } from "../lib/store";

const COLUMNS = [
  { key: "todo", label: "To Do" },
  { key: "in-progress", label: "In Progress" },
  { key: "review", label: "In Review" },
  { key: "done", label: "Done" },
];

function BoardColumn({ col, children, count }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.key });
  return (
    <div className="board-col" ref={setNodeRef} style={{ background: isOver ? "var(--accent-soft)" : undefined }}>
      <div className="board-col-title">
        <span>{col.label}</span>
        <span>{count}</span>
      </div>
      {children}
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const { user, ready, logout } = useSession();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dueDate, setDueDate] = useState("");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function refresh() {
    setProject(getProject(id));

    const allTasks = getTasksByProject(id);

    if (user.role === "Project Manager") {
      setTasks(allTasks);
    } else {
      setTasks(
        allTasks.filter((task) => task.assignee === user.id)
      );
    }

    setUsers(getUsers());
  }

  useEffect(() => {
    if (!ready) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, id]);

  if (!ready || !project) return null;

  const isPM = user.role === "Project Manager";
  const projectMembers = users.filter((u) =>
    project.members?.includes(u.id)
  );
  function canEdit(task) {
    return isPM || task.assignee === user.id;
  }
  const myTasks = tasks.filter(
    (task) => task.assignee === user.id
  );
  const userName = (uid) => users.find((u) => u.id === uid)?.name || "Unassigned";

  function moveTask(task, newStatus) {
    updateTask(task.id, {
      status: newStatus,
    });

    addNotification({
      userId: task.assignee,
      title: "Task Status Updated",
      message: `${task.title} moved to ${newStatus}`,
    });

    refresh();
  }

  function canEditTask(task) {
    return isPM || task.assignee === user.id;
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) return;
    const task = tasks.find((t) => t.id === active.id);
    if (!task) return;
    const newStatus = over.id;
    if (task.status === newStatus) return;
    if (!canEditTask(task)) return;
    moveTask(task, newStatus);
  }

  return (
    <div className="app-shell">
      <Sidebar user={user} onLogout={logout} />
      <div className="main-col">
        <Topbar user={user} />
        <main className="content" style={{ maxWidth: 1100 }}>
          <div className="page-header">
            <div>
              <h1>{project.name}</h1>
              <p>{project.description}</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Link to={`/projects/${id}/sprints`} className="btn">Sprints</Link>
              <Link to={`/projects/${id}/bugs`} className="btn">Bugs</Link>
              {isPM && (
                <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
                  {showForm ? "Close" : "+ New task"}
                </button>
              )}
            </div>
          </div>

          {showForm && (
            <NewTaskForm
              projectId={id}
              users={projectMembers}
              onCreated={() => {
                setShowForm(false);
                refresh();
              }}
            />
          )}
          <div
            className="card"
            style={{
              marginBottom: 20
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 10
              }}
            >
              <input
                placeholder="Search task..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
            <div className="board">
              {COLUMNS.map((col) => {
                const sourceTasks =
                  user.role === "Project Manager"
                    ? tasks
                    : myTasks;

                const filteredTasks = sourceTasks.filter((t) => {
                  if (
                    search &&
                    !t.title.toLowerCase().includes(search.toLowerCase())
                  )
                    return false;

                  if (
                    priorityFilter !== "all" &&
                    t.priority !== priorityFilter
                  )
                    return false;

                  if (
                    statusFilter !== "all" &&
                    t.status !== statusFilter
                  )
                    return false;

                  return true;
                });

                const colTasks = filteredTasks.filter(
                  (t) => t.status === col.key
                );
                return (
                  <BoardColumn key={col.key} col={col} count={colTasks.length}>
                    {colTasks.map((t) => (
                      <TaskCard
                        key={t.id}
                        task={t}
                        assigneeName={userName(t.assignee)}
                        canEdit={canEditTask(t)}
                        onMove={moveTask}
                        onOpen={setSelectedTask}
                      />
                    ))}
                    {colTasks.length === 0 && <p style={{ fontSize: 12, color: "var(--muted)", padding: "0 6px" }}>No tasks</p>}
                  </BoardColumn>
                );
              })}
            </div>
          </DndContext>
        </main>
      </div>

      {selectedTask && (
        <TaskDetailPanel
          task={tasks.find((t) => t.id === selectedTask.id) || selectedTask}
          user={user}
          userName={userName}
          canEdit={canEditTask(selectedTask)}
          onClose={() => setSelectedTask(null)}
          onChanged={refresh}
        />
      )}
    </div>
  );
}

function NewTaskForm({ projectId, users, onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("task");
  const [priority, setPriority] = useState("medium");
  const [assignee, setAssignee] = useState(users[0]?.id || "");
  const [dueDate, setDueDate] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim()) return;

    if (!assignee) {
      alert("Please assign the task.");
      return;
    }

    addTask({
      projectId,
      title: title.trim(),
      description: description.trim(),
      type,
      priority,
      assignee,
      dueDate,
      estimatedHours,
    });

    addNotification({
      userId: assignee,
      title: "New Task Assigned",
      message: `${title} has been assigned to you.`,
    });

    onCreated();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card"
      style={{ marginBottom: 22 }}
    >
      <h3 style={{ marginBottom: 20 }}>
        Create New Task
      </h3>

      <div className="field">
        <label>Task Title</label>

        <input
          placeholder="Create Login Page"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="field">
        <label>Description</label>

        <textarea
          rows={4}
          placeholder="Enter task description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2,1fr)",
          gap: 16,
        }}
      >
        <div className="field">
          <label>Priority</label>

          <select
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value)
            }
          >
            <option value="low">Low</option>
            <option value="medium">
              Medium
            </option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="field">
          <label>Task Type</label>

          <select
            value={type}
            onChange={(e) =>
              setType(e.target.value)
            }
          >
            <option value="task">Task</option>
            <option value="bug">Bug</option>
          </select>
        </div>

        <div className="field">
          <label>Assign To</label>

          <select
            value={assignee}
            onChange={(e) =>
              setAssignee(e.target.value)
            }
          >
            {users.map((u) => (
              <option
                key={u.id}
                value={u.id}
              >
                {u.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Due Date</label>

          <input
            type="date"
            value={dueDate}
            onChange={(e) =>
              setDueDate(e.target.value)
            }
          />
        </div>

        <div className="field">
          <label>Estimated Hours</label>

          <input
            type="number"
            min="1"
            placeholder="8"
            value={estimatedHours}
            onChange={(e) =>
              setEstimatedHours(e.target.value)
            }
          />
        </div>
      </div>

      <button
        className="btn btn-primary"
        style={{
          marginTop: 18,
          width: 180,
        }}
      >
        Create Task
      </button>
    </form>
  );
}

function TaskDetailPanel({ task, user, userName, canEdit, onClose, onChanged }) {
  const [hours, setHours] = useState("");
  const [comment, setComment] = useState("");
  const loggedHours = task.hoursLogged || 0;
  const comments = task.comments || [];

  function logHours(e) {
    e.preventDefault();
    const n = parseFloat(hours);
    if (!n || n <= 0) return;
    updateTask(task.id, { hoursLogged: loggedHours + n });
    setHours("");
    onChanged();
  }

  function postComment(e) {
    e.preventDefault();
    if (!comment.trim()) return;
    const entry = { id: `c-${Date.now()}`, author: user.name, text: comment.trim(), createdAt: Date.now() };
    updateTask(task.id, { comments: [...comments, entry] });
    setComment("");
    onChanged();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(20,20,15,0.35)", display: "flex", justifyContent: "flex-end", zIndex: 20 }} onClick={onClose}>
      <div className="card" style={{ width: 400, height: "100%", borderRadius: 0, overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
          <div>
            <span className="task-key">{task.key}</span>
            <h3 style={{ marginTop: 8, fontSize: 16 }}>{task.title}</h3>
          </div>
          <button className="btn" onClick={onClose}>Close</button>
        </div>

        <p style={{ color: "var(--muted)", fontSize: 13.5, margin: "12px 0" }}>{task.description}</p>

        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          <span className={`badge badge-${task.status}`}>{task.status}</span>
          <span className={`badge badge-${task.priority}`}>{task.priority}</span>
          <span className={`badge badge-${task.type}`}>{task.type}</span>
        </div>

        <p style={{ fontSize: 13 }}><strong>Assignee:</strong> {userName(task.assignee)}</p>

        <div className="card" style={{ margin: "16px 0" }}>
          <h4 style={{ fontSize: 13.5, marginBottom: 8 }}>Time tracking</h4>
          <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10 }}>{loggedHours} hour(s) logged</p>
          {canEdit && (
            <form onSubmit={logHours} style={{ display: "flex", gap: 8 }}>
              <input type="number" min="0.25" step="0.25" placeholder="Hours" value={hours} onChange={(e) => setHours(e.target.value)} />
              <button type="submit" className="btn btn-primary">Log</button>
            </form>
          )}
        </div>

        <div>
          <h4 style={{ fontSize: 13.5, marginBottom: 8 }}>Comments</h4>
          {comments.length === 0 && <p style={{ fontSize: 12.5, color: "var(--muted)" }}>No comments yet.</p>}
          {comments.map((c) => (
            <div key={c.id} style={{ marginBottom: 10, fontSize: 13 }}>
              <strong>{c.author}</strong> <span style={{ color: "var(--muted)", fontSize: 11.5 }}>{new Date(c.createdAt).toLocaleString()}</span>
              <p style={{ margin: "2px 0 0" }}>{c.text}</p>
            </div>
          ))}
          <form onSubmit={postComment} style={{ marginTop: 10 }}>
            <textarea rows={2} placeholder="Add an update..." value={comment} onChange={(e) => setComment(e.target.value)} />
            <button type="submit" className="btn" style={{ marginTop: 6 }}>Comment</button>
          </form>
        </div>
      </div>
    </div>
  );
}