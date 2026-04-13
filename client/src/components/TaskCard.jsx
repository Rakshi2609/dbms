import { formatDateTime } from '../utils/date';

export function TaskCard({ task, onOpenTask }) {
  return (
    <article
      className={`task-card priority-${task.priority}`}
      draggable
      onDragStart={(event) => event.dataTransfer.setData('text/task-id', String(task.id))}
      onClick={() => onOpenTask(task.id)}
    >
      <div className="task-card-top">
        <span className="task-priority">P{task.priority}</span>
        <span className="task-category">{task.category?.name || 'Uncategorized'}</span>
      </div>
      <h3>{task.title}</h3>
      <p>{task.description || 'No description provided.'}</p>
      <div className="task-meta">
        <span>{task.assignees.length} assignees</span>
        <span>{formatDateTime(task.dueDate)}</span>
      </div>
    </article>
  );
}
