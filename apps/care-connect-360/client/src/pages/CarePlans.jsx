import { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';

export default function CarePlans() {
  const { token } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/care-plans', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(setList)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p>Loading...</p>;
  return (
    <div>
      <h1 style={{ margin: '0 0 1rem' }}>Care plans</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>Collaborative care plans.</p>
      {list.length === 0 && <p style={{ color: 'var(--muted)' }}>No care plans.</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {list.map(c => (
          <div key={c.id} style={{ padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <strong>{c.title}</strong>
            {c.description && <p style={{ margin: '0.5rem 0 0', color: 'var(--muted)', fontSize: '0.9rem' }}>{c.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
