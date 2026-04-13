import { useState } from 'react';
import { AuthForm } from '../components/AuthForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export function AuthPage() {
  const { login, register, loading } = useAuth();
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');

  const submit = async (payload) => {
    try {
      setError('');
      if (mode === 'login') {
        await login(payload);
      } else {
        await register(payload);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to authenticate');
    }
  };

  return (
    <main className="auth-layout">
      <section className="auth-panel">
        <div className="hero-copy">
          <p className="eyebrow">DBMS Showcase</p>
          <h1>Task management backed by normalized PostgreSQL relations.</h1>
          <p>
            Demonstrates 3NF schema design, ACID-safe transactions, foreign keys, constraints,
            indexed task retrieval, and aggregated reporting queries.
          </p>
        </div>
        <AuthForm
          mode={mode}
          onSubmit={submit}
          onToggle={() => setMode((current) => (current === 'login' ? 'register' : 'login'))}
          loading={loading}
        />
        {error && <p className="error-banner">{error}</p>}
      </section>
    </main>
  );
}
