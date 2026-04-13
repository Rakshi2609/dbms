export function FiltersBar({ filters, categories, onChange, onCreate }) {
  return (
    <section className="toolbar">
      <div className="filter-grid">
        <label>
          Priority
          <select value={filters.priority} onChange={(event) => onChange('priority', event.target.value)}>
            <option value="">All</option>
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label>
          Category
          <select value={filters.categoryId} onChange={(event) => onChange('categoryId', event.target.value)}>
            <option value="">All</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Due before
          <input
            type="date"
            value={filters.dueBefore}
            onChange={(event) => onChange('dueBefore', event.target.value)}
          />
        </label>

        <label className="checkbox">
          <input
            type="checkbox"
            checked={filters.assignedToMe}
            onChange={(event) => onChange('assignedToMe', String(event.target.checked))}
          />
          Assigned to me
        </label>
      </div>

      <button onClick={onCreate}>New task</button>
    </section>
  );
}
