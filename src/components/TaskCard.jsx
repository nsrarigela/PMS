import { useDraggable } from "@dnd-kit/core";

const COLUMNS = ["todo", "in-progress", "review", "done"];

function initials(name) {
  if (!name) return "?";
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

export default function TaskCard({ task, assigneeName, canEdit, onMove, onOpen }) {
  const colIndex = COLUMNS.indexOf(task.status);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    disabled: !canEdit,
  });

  const style = {
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.6 : 1,
    position: isDragging ? "relative" : "static",
  };

  return (
    <div className="task-card" ref={setNodeRef} style={style}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="task-key">{task.key}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span className={`badge badge-${task.type}`}>{task.type}</span>
          {canEdit && (
            <span
              className="drag-handle"
              {...listeners}
              {...attributes}
              title="Drag to move"
            >
              ⠿
            </span>
          )}
        </div>
      </div>

      <div className="task-card-title" role="button" onClick={() => onOpen(task)} style={{ cursor: "pointer" }}>
        {task.title}
      </div>

      <div className="task-card-footer">
        <span className={`badge badge-${task.priority}`}>{task.priority}</span>
        <span className="avatar" title={assigneeName}>{initials(assigneeName)}</span>
      </div>

      {canEdit && (
        <div className="move-btns" style={{ marginTop: 8 }}>
          <button disabled={colIndex <= 0} onClick={() => onMove(task, COLUMNS[colIndex - 1])}>&larr; back</button>
          <button disabled={colIndex >= COLUMNS.length - 1} onClick={() => onMove(task, COLUMNS[colIndex + 1])}>forward &rarr;</button>
        </div>
      )}
    </div>
  );
}