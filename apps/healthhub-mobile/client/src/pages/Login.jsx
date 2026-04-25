import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setError(data.error || 'Login failed'); return; }
    setAuth(data.token, data.user);
    navigate('/');
  };

  const inputStyle = { width: '100%', padding: '0.85rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '1rem' };
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <h1 style={{ margin: '0 0 0.5rem', color: 'var(--accent)' }}>HealthHub Mobile</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>Your health at your fingertips.</p>
        <form onSubmit={submit}>
          {error && <p style={{ color: '#dc2626', marginBottom: '0.5rem' }}>{error}</p>}
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ ...inputStyle, marginTop: '0.75rem' }} />
          <button type="submit" style={{ ...inputStyle, marginTop: '1rem', background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Sign in</button>
        </form>
        <p style={{ marginTop: '1rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
          No account? <Link to="/register" style={{ color: 'var(--accent)' }}>Register</Link>
        </p>
      </div>
    </div>
  );
}
