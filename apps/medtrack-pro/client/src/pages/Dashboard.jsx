import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function Dashboard() {
  const { token, user } = useAuth();
  const [medications, setMedications] = useState([]);
  const [adherence, setAdherence] = useState(null);

  useEffect(() => {
    const f = async () => {
      const [medRes, logRes] = await Promise.all([
        fetch('/api/medications', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/schedules/logs', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (medRes.ok) setMedications(await medRes.json());
      if (logRes.ok) {
        const logs = await logRes.json();
        const total = logs.length;
        const taken = logs.filter(l => l.taken_at).length;
        setAdherence(total ? Math.round((taken / total) * 100) : 0);
      }
    };
    f();
  }, [token]);

  return (
    <div>
      <h1 style={{ margin: '0 0 1rem' }}>Dashboard</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>Your medication overview.</p>

      <div style={{ ...cardStyle, marginBottom: '1rem', padding: '0.75rem 1rem' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Your MedTrack Pro user ID</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <code style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>{user?.id}</code>
          <button
            type="button"
            onClick={() => { navigator.clipboard?.writeText(user?.id || ''); }}
            style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', cursor: 'pointer' }}
          >
            Copy
          </button>
        </div>
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: 'var(--muted)' }}>Share this ID with your provider so they can link your CareConnect360 record to your medications.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={cardStyle}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>{medications.length}</div>
          <div style={{ color: 'var(--muted)' }}>Medications</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>{adherence ?? '—'}%</div>
          <div style={{ color: 'var(--muted)' }}>Adherence</div>
        </div>
      </div>
      <div style={{ marginTop: '1.5rem' }}>
        <Link to="/medications" style={{ color: 'var(--accent)', marginRight: '1rem' }}>Manage medications →</Link>
        <Link to="/schedules" style={{ color: 'var(--accent)' }}>View schedules →</Link>
      </div>
    </div>
  );
}

const cardStyle = { padding: '1.25rem', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' };
