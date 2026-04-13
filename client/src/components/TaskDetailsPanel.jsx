import { useState } from 'react';
import { formatDateTime } from '../utils/date';

export function TaskDetailsPanel({ task, onClose, onDelete, onEdit, onComment }) {
  const [comment, setComment] = useState('');

  if (!task) {
    return (
      <aside className="details-panel empty-panel">
        <h2>Select a task</h2>
        <p>Open a card to inspect comments, assignments, and activity logs.</p>
      </aside>
    );
  }

  const submitComment = async (event) => {
    event.preventDefault();
    await onComment(comment);
    setComment('');
  };

  return (
    <aside className="details-panel">
      <div className="details-header">
        <div>
          <p className="eyebrow">Task #{task.id}</p>
          <h2>{task.title}</h2>
        </div>
        <button type="button" className="button-secondary" onClick={onClose}>
          Clear
        </button>
      </div>

      <div className="detail-actions">
        <button onClick={onEdit}>Edit task</button>
        <button className="button-danger" onClick={() => onDelete(task.id)}>
          Delete
        </button>
      </div>

      <dl className="detail-grid">
        <div>
          <dt>Status</dt>
          <dd>{task.status}</dd>
        </div>
        <div>
          <dt>Priority</dt>
          <dd>{task.priority}</dd>
        </div>
        <div>
          <dt>Category</dt>
          <dd>{task.category?.name || 'None'}</dd>
        </div>
        <div>
          <dt>Due</dt>
          <dd>{formatDateTime(task.dueDate)}</dd>
        </div>
      </dl>

      <section>
        <h3>Description</h3>
        <p>{task.description || 'No description available.'}</p>
      </section>

      <section>
        <h3>Assignees</h3>
        <div className="chip-grid">
          {task.assignees.map((assignee) => (
            <span className="chip-option active" key={assignee.id}>
              {assignee.fullName}
            </span>
          ))}
        </div>
      </section>

      <section>
        <h3>Comments</h3>
        <form className="comment-form" onSubmit={submitComment}>
          <textarea value={comment} onChange={(event) => setComment(event.target.value)} rows="3" />
          <button type="submit">Add comment</button>
        </form>
        <div className="timeline">
          {task.comments.map((item) => (
            <article key={item.id} className="timeline-item">
              <strong>{item.user.fullName}</strong>
              <span>{formatDateTime(item.createdAt)}</span>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h3>Activity logs</h3>
        <div className="timeline">
          {task.activityLogs.map((item) => (
            <article key={item.id} className="timeline-item">
              <strong>{item.actionType}</strong>
              <span>{formatDateTime(item.createdAt)}</span>
              <p>
                {item.actor?.fullName || 'System'} {item.oldStatus ? `moved from ${item.oldStatus}` : ''}
                {item.newStatus ? ` to ${item.newStatus}` : ''}
              </p>
            </article>
          ))}
        </div>
      </section>
    </aside>
  );
}
