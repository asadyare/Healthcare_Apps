import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

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
          <strong style={{ color: 'var(--accent)' }}>MedTrack Pro</strong>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{user?.email}</div>
        </div>
        <NavLink to="/" end style={linkStyle} className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink>
        <NavLink to="/medications" style={linkStyle} className={({ isActive }) => isActive ? 'active' : ''}>Medications</NavLink>
        <NavLink to="/schedules" style={linkStyle} className={({ isActive }) => isActive ? 'active' : ''}>Schedules</NavLink>
        <button onClick={handleLogout} style={{ margin: '1rem', padding: '0.5rem', background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer' }}>Log out</button>
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
const activeStyle = { color: 'var(--text)', background: 'var(--border)' };
