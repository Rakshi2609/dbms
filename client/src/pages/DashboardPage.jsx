import { useState } from 'react';
import { FiltersBar } from '../components/FiltersBar.jsx';
import { KanbanBoard } from '../components/KanbanBoard.jsx';
import { ReportsPanel } from '../components/ReportsPanel.jsx';
import { TaskDetailsPanel } from '../components/TaskDetailsPanel.jsx';
import { TaskFormModal } from '../components/TaskFormModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTaskData } from '../hooks/useTaskData.js';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const [filters, setFilters] = useState({
    priority: '',
    categoryId: '',
    dueBefore: '',
    assignedToMe: 'false'
  });
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const taskData = useTaskData(filters);

  const handleCreate = () => {
    setEditingTask(null);
    setShowModal(true);
  };

  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Normalized Task Platform</p>
          <h1>Welcome back, {user?.fullName}</h1>
          <p className="muted">{taskData.tasks.length} tasks loaded with DB-level filtering and pagination support.</p>
        </div>
        <div className="topbar-actions">
          <button className="button-secondary" onClick={taskData.loadDashboard}>
            Refresh
          </button>
          <button className="button-secondary" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <ReportsPanel reports={taskData.reports} />

      <FiltersBar
        filters={filters}
        categories={taskData.categories}
        onChange={(field, value) => setFilters((current) => ({ ...current, [field]: value }))}
        onCreate={handleCreate}
      />

      <section className="workspace-grid">
        <div>
          <KanbanBoard
            tasks={taskData.tasks}
            onOpenTask={taskData.openTask}
            onMoveTask={taskData.moveTask}
          />
        </div>

        <TaskDetailsPanel
          task={taskData.selectedTask}
          onClose={() => taskData.setSelectedTask(null)}
          onDelete={taskData.removeTask}
          onEdit={() => {
            setEditingTask(taskData.selectedTask);
            setShowModal(true);
          }}
          onComment={(body) => taskData.createComment(taskData.selectedTask.id, body)}
        />
      </section>

      <TaskFormModal
        open={showModal}
        task={editingTask}
        categories={taskData.categories}
        users={taskData.users}
        onClose={() => setShowModal(false)}
        onSave={async (payload) => {
          const task = await taskData.saveTask(payload);
          setShowModal(false);
          setEditingTask(null);
          await taskData.openTask(task.id);
        }}
      />
    </main>
  );
}
