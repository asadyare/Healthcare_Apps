import { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';

export default function Messaging() {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/messaging', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(setMessages)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p>Loading...</p>;
  return (
    <div>
      <h1 style={{ margin: '0 0 1rem' }}>Secure messaging</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>HIPAA-compliant messaging.</p>
      {messages.length === 0 && <p style={{ color: 'var(--muted)' }}>No messages.</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {messages.map(m => (
          <div key={m.id} style={{ padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            {m.subject && <strong>{m.subject}</strong>}
            <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>{m.body}</p>
            <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{new Date(m.created_at).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
