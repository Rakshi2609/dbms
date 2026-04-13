import { useEffect, useState } from 'react';
import { toInputDateTime } from '../utils/date';

const initialForm = {
  title: '',
  description: '',
  categoryId: '',
  priority: 3,
  status: 'pending',
  dueDate: '',
  assignedUserIds: [],
  recurringTask: null
};

export function TaskFormModal({ open, task, categories, users, onClose, onSave }) {
  const [form, setForm] = useState(initialForm);
  const [recurringEnabled, setRecurringEnabled] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({
        id: task.id,
        title: task.title,
        description: task.description || '',
        categoryId: task.category?.id || '',
        priority: task.priority,
        status: task.status,
        dueDate: toInputDateTime(task.dueDate),
        assignedUserIds: task.assignees.map((assignee) => assignee.id),
        recurringTask: task.recurringTask
          ? {
              frequency: task.recurringTask.frequency,
              intervalValue: task.recurringTask.intervalValue,
              nextRunAt: toInputDateTime(task.recurringTask.nextRunAt),
              endDate: task.recurringTask.endDate || ''
            }
          : null
      });
      setRecurringEnabled(Boolean(task.recurringTask));
    } else {
      setForm(initialForm);
      setRecurringEnabled(false);
    }
  }, [task, open]);

  if (!open) {
    return null;
  }

  const toggleAssignee = (userId) => {
    setForm((current) => ({
      ...current,
      assignedUserIds: current.assignedUserIds.includes(userId)
        ? current.assignedUserIds.filter((value) => value !== userId)
        : [...current.assignedUserIds, userId]
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    await onSave({
      ...form,
      categoryId: form.categoryId || null,
      dueDate: form.dueDate || null,
      recurringTask: recurringEnabled
        ? {
            ...form.recurringTask,
            intervalValue: Number(form.recurringTask?.intervalValue || 1),
            nextRunAt: form.recurringTask?.nextRunAt || null,
            endDate: form.recurringTask?.endDate || null
          }
        : null
    });
  };

  return (
    <div className="modal-backdrop">
      <form className="modal-card" onSubmit={submit}>
        <div className="modal-header">
          <h2>{task ? 'Edit task' : 'Create task'}</h2>
          <button type="button" className="button-secondary" onClick={onClose}>
            Close
          </button>
        </div>

        <label>
          Title
          <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
        </label>

        <label>
          Description
          <textarea
            rows="4"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
          />
        </label>

        <div className="two-column">
          <label>
            Category
            <select
              value={form.categoryId}
              onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
            >
              <option value="">None</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Priority
            <select value={form.priority} onChange={(event) => setForm({ ...form, priority: Number(event.target.value) })}>
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="two-column">
          <label>
            Status
            <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </label>

          <label>
            Due date
            <input
              type="datetime-local"
              value={form.dueDate}
              onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
            />
          </label>
        </div>

        <fieldset>
          <legend>Assignments</legend>
          <div className="chip-grid">
            {users.map((user) => (
              <label key={user.id} className="chip-option">
                <input
                  type="checkbox"
                  checked={form.assignedUserIds.includes(user.id)}
                  onChange={() => toggleAssignee(user.id)}
                />
                {user.fullName}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="checkbox">
          <input
            type="checkbox"
            checked={recurringEnabled}
            onChange={(event) => {
              setRecurringEnabled(event.target.checked);
              setForm((current) => ({
                ...current,
                recurringTask: event.target.checked
                  ? current.recurringTask || {
                      frequency: 'weekly',
                      intervalValue: 1,
                      nextRunAt: '',
                      endDate: ''
                    }
                  : null
              }));
            }}
          />
          Recurring task
        </label>

        {recurringEnabled && (
          <div className="three-column">
            <label>
              Frequency
              <select
                value={form.recurringTask?.frequency || 'weekly'}
                onChange={(event) =>
                  setForm({
                    ...form,
                    recurringTask: { ...form.recurringTask, frequency: event.target.value }
                  })
                }
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom</option>
              </select>
            </label>

            <label>
              Interval
              <input
                type="number"
                min="1"
                value={form.recurringTask?.intervalValue || 1}
                onChange={(event) =>
                  setForm({
                    ...form,
                    recurringTask: { ...form.recurringTask, intervalValue: event.target.value }
                  })
                }
              />
            </label>

            <label>
              Next run
              <input
                type="datetime-local"
                value={form.recurringTask?.nextRunAt || ''}
                onChange={(event) =>
                  setForm({
                    ...form,
                    recurringTask: { ...form.recurringTask, nextRunAt: event.target.value }
                  })
                }
              />
            </label>
          </div>
        )}

        <button type="submit">{task ? 'Save changes' : 'Create task'}</button>
      </form>
    </div>
  );
}
