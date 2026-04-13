export function ReportsPanel({ reports }) {
  return (
    <section className="reports-grid">
      <article className="report-card">
        <h2>Assignee Workload</h2>
        <div className="report-list">
          {reports.workload.map((item) => (
            <div key={item.id} className="report-row">
              <span>{item.fullName}</span>
              <span>{item.assignedTasks} assigned</span>
              <span>{item.overdueTasks} overdue</span>
            </div>
          ))}
        </div>
      </article>

      <article className="report-card">
        <h2>Category Completion</h2>
        <div className="report-list">
          {reports.categories.map((item) => (
            <div key={item.id} className="report-row">
              <span>{item.name}</span>
              <span>{item.total_tasks} total</span>
              <span>{item.completion_rate || 0}% complete</span>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
