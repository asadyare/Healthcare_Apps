import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav style={{
        width: 220,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        padding: '1rem 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
      }}>
        <div style={{ padding: '0 1rem 1rem', borderBottom: '1px solid var(--border)', marginBottom: '0.5rem' }}>
          <strong style={{ color: 'var(--accent)' }}>CareConnect360</strong>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{user?.email}</div>
        </div>
        <NavLink to="/patients" style={linkStyle} className={({ isActive }) => isActive ? 'active' : ''}>Patients</NavLink>
        <NavLink to="/appointments" style={linkStyle} className={({ isActive }) => isActive ? 'active' : ''}>Appointments</NavLink>
        <NavLink to="/care-plans" style={linkStyle} className={({ isActive }) => isActive ? 'active' : ''}>Care plans</NavLink>
        <NavLink to="/messaging" style={linkStyle} className={({ isActive }) => isActive ? 'active' : ''}>Messaging</NavLink>
        <button onClick={() => { logout(); navigate('/login'); }} style={btnStyle}>Log out</button>
      </nav>
      <main style={{ flex: 1, padding: '1.5rem' }}>
        <Outlet />
      </main>
    </div>
  );
}

const linkStyle = {
  padding: '0.6rem 1rem',
  color: 'var(--muted)',
  textDecoration: 'none',
  margin: '0 0.5rem',
  borderRadius: 'var(--radius)',
};
const btnStyle = { margin: '1rem', padding: '0.5rem', background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer' };
