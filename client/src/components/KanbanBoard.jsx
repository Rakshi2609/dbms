import { TaskCard } from './TaskCard.jsx';

const columns = [
  { key: 'pending', title: 'Pending' },
  { key: 'in-progress', title: 'In Progress' },
  { key: 'completed', title: 'Completed' }
];

export function KanbanBoard({ tasks, onOpenTask, onMoveTask }) {
  const grouped = columns.map((column) => ({
    ...column,
    tasks: tasks.filter((task) => task.status === column.key)
  }));

  const handleDrop = (event, status) => {
    event.preventDefault();
    const taskId = Number(event.dataTransfer.getData('text/task-id'));
    if (taskId) {
      onMoveTask(taskId, status);
    }
  };

  return (
    <section className="kanban-grid">
      {grouped.map((column) => (
        <div
          key={column.key}
          className="kanban-column"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => handleDrop(event, column.key)}
        >
          <div className="column-header">
            <h2>{column.title}</h2>
            <span>{column.tasks.length}</span>
          </div>

          <div className="column-body">
            {column.tasks.map((task) => (
              <TaskCard key={task.id} task={task} onOpenTask={onOpenTask} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
