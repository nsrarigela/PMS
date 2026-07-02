import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors, useDroppable } from "@dnd-kit/core";
import Sidebar from "../components/Sidebar";
import TaskCard from "../components/TaskCard";
import { useSession } from "../lib/useSession";
import { getProject, getTasksByProject, getUsers, addTask, updateTask } from "../lib/store";

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

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function refresh() {
    setProject(getProject(id));
    setTasks(getTasksByProject(id));
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

  function moveTask(task, newStatus) {
    updateTask(task.id, { status: newStatus });
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
            users={users}
            onCreated={() => { setShowForm(false); refresh(); }}
          />
        )}

        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
          <div className="board">
            {COLUMNS.map((col) => {
              const colTasks = tasks.filter((t) => t.status === col.key);
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

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    addTask({ projectId, title: title.trim(), description: description.trim(), type, priority, assignee });
    onCreated();
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ marginBottom: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 12 }}>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Fix login redirect bug" />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="task">Task</option>
            <option value="bug">Bug</option>
          </select>
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
        <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Details for whoever picks this up..." />
      </div>
      <button type="submit" className="btn btn-primary">Add task</button>
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