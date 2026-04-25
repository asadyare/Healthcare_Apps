import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      <header style={{
        padding: '1rem 1.25rem',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong style={{ color: 'var(--accent)', fontSize: '1.1rem' }}>HealthHub Mobile</strong>
          <button onClick={() => { logout(); navigate('/login'); }} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.9rem' }}>Sign out</button>
        </div>
      </header>
      <main style={{ padding: '1rem 1.25rem', maxWidth: 480, margin: '0 auto' }}>
        <Outlet />
      </main>
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '0.5rem 0',
        maxWidth: 480,
        margin: '0 auto',
      }}>
        <NavLink to="/" end style={navStyle} className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink>
        <NavLink to="/profile" style={navStyle} className={({ isActive }) => isActive ? 'active' : ''}>Profile</NavLink>
      </nav>
    </div>
  );
}

const navStyle = {
  padding: '0.5rem 1rem',
  color: 'var(--muted)',
  textDecoration: 'none',
  fontSize: '0.9rem',
  borderRadius: 'var(--radius)',
};
