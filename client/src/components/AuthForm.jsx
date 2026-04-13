import { useState } from 'react';

export function AuthForm({ mode, onSubmit, onToggle, loading }) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(form);
  };

  return (
    <form className="auth-card" onSubmit={handleSubmit}>
      <p className="eyebrow">JWT Authentication</p>
      <h1>{mode === 'login' ? 'TaskFlow DBMS' : 'Create your account'}</h1>
      <p className="muted">
        Normalized PostgreSQL schema, transactional task workflows, and a Kanban dashboard.
      </p>

      {mode === 'register' && (
        <label>
          Full name
          <input
            value={form.fullName}
            onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
            placeholder="Aarav Sharma"
          />
        </label>
      )}

      <label>
        Email
        <input
          type="email"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          placeholder="user@example.com"
        />
      </label>

      <label>
        Password
        <input
          type="password"
          value={form.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          placeholder="Minimum 6 characters"
        />
      </label>

      <button type="submit" disabled={loading}>
        {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Register'}
      </button>

      <button type="button" className="button-secondary" onClick={onToggle}>
        {mode === 'login' ? 'Need an account?' : 'Already have an account?'}
      </button>
    </form>
  );
}
