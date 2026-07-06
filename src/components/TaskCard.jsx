import { useDraggable } from "@dnd-kit/core";

const COLUMNS = ["todo", "in-progress", "review", "done"];

function initials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function isOverdue(date) {
  if (!date) return false;
  return new Date(date) < new Date();
}

export default function TaskCard({
  task,
  assigneeName,
  canEdit,
  onMove,
  onOpen,
}) {
  const colIndex = COLUMNS.indexOf(task.status);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      disabled: !canEdit,
    });

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.6 : 1,
    position: isDragging ? "relative" : "static",
  };

  return (
    <div className="task-card" ref={setNodeRef} style={style}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span className="task-key">{task.key}</span>

        <div style={{ display: "flex", gap: 6 }}>
          <span className={`badge badge-${task.type}`}>
            {task.type}
          </span>

          {canEdit && (
            <span
              className="drag-handle"
              {...listeners}
              {...attributes}
              title="Drag task"
            >
              ⠿
            </span>
          )}
        </div>
      </div>

      <div
        className="task-card-title"
        style={{ cursor: "pointer" }}
        onClick={() => onOpen(task)}
      >
        {task.title}
      </div>

      <p
        style={{
          fontSize: 12,
          color: "var(--muted)",
          marginTop: 5,
        }}
      >
        {task.description}
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 10,
          fontSize: 12,
        }}
      >
        <span>👤 {assigneeName}</span>

        <span>
          ⏱ {task.hoursLogged || 0}h
        </span>
      </div>

      {task.dueDate && (
        <div
          style={{
            marginTop: 6,
            color: isOverdue(task.dueDate)
              ? "red"
              : "var(--muted)",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          📅 {task.dueDate}
        </div>
      )}

      <div
        className="task-card-footer"
        style={{ marginTop: 10 }}
      >
        <span className={`badge badge-${task.priority}`}>
          {task.priority}
        </span>

        <span className="avatar">
          {initials(assigneeName)}
        </span>
      </div>

      {canEdit && (
        <div
          className="move-btns"
          style={{ marginTop: 10 }}
        >
          <button
            disabled={colIndex <= 0}
            onClick={() =>
              onMove(task, COLUMNS[colIndex - 1])
            }
          >
            ← Back
          </button>

          <button
            disabled={colIndex >= COLUMNS.length - 1}
            onClick={() =>
              onMove(task, COLUMNS[colIndex + 1])
            }
          >
            Forward →
          </button>
        </div>
      )}
    </div>
  );
}