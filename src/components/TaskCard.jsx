// One card = one task. `columns` is the ordered list of statuses, used to
// figure out which arrow buttons ("<" / ">") should be shown/enabled.
const COLUMNS = ["todo", "in-progress", "review", "done"];

function initials(name) {
  if (!name) return "?";
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

export default function TaskCard({ task, assigneeName, canEdit, onMove, onOpen }) {
  const colIndex = COLUMNS.indexOf(task.status);

  return (
    <div className="task-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="task-key">{task.key}</span>
        <span className={`badge badge-${task.type}`}>{task.type}</span>
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
