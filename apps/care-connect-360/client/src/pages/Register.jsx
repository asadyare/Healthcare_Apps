import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('provider');
  const [error, setError] = useState('');
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, role }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setError(data.error || 'Registration failed'); return; }
    setAuth(data.token, data.user);
    navigate('/patients');
  };

  const inputStyle = { width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' };
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 360, padding: '2rem', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <h1 style={{ margin: '0 0 1rem', color: 'var(--accent)' }}>CareConnect360</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>Create a provider account.</p>
        <form onSubmit={submit}>
          {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
          <label style={{ display: 'block', marginTop: '0.75rem', fontSize: '0.9rem' }}>Name</label>
          <input type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
          <label style={{ display: 'block', marginTop: '0.75rem', fontSize: '0.9rem' }}>Email</label>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
          <label style={{ display: 'block', marginTop: '0.75rem', fontSize: '0.9rem' }}>Password</label>
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />
          <label style={{ display: 'block', marginTop: '0.75rem', fontSize: '0.9rem' }}>Role</label>
          <select value={role} onChange={e => setRole(e.target.value)} style={inputStyle}>
            <option value="provider">Provider</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" style={{ ...inputStyle, marginTop: '1rem', background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Register</button>
        </form>
        <p style={{ marginTop: '1rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
