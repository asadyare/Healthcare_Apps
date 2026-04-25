import { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';

export default function Medications() {
  const { token } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', dosage: '', frequency: '', instructions: '', refill_reminder_days: '' });

  const load = async () => {
    const res = await fetch('/api/medications', { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setList(await res.json());
    setLoading(false);
  };
  useEffect(() => { load(); }, [token]);

  const create = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/medications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    if (res.ok) { setForm({ name: '', dosage: '', frequency: '', instructions: '', refill_reminder_days: '' }); setShowForm(false); load(); }
  };

  const remove = async (id) => {
    if (!confirm('Remove this medication?')) return;
    await fetch(`/api/medications/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    load();
  };

  if (loading) return <p>Loading...</p>;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0 }}>Medications</h1>
        <button onClick={() => setShowForm(!showForm)} style={btnStyle}>Add medication</button>
      </div>
      {showForm && (
        <form onSubmit={create} style={{ ...cardStyle, marginBottom: '1rem' }}>
          <input placeholder="Medication name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required style={inputStyle} />
          <input placeholder="Dosage" value={form.dosage} onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))} style={inputStyle} />
          <input placeholder="Frequency" value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))} style={inputStyle} />
          <input placeholder="Instructions" value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} style={inputStyle} />
          <input type="number" placeholder="Refill reminder (days)" value={form.refill_reminder_days} onChange={e => setForm(f => ({ ...f, refill_reminder_days: e.target.value || '' }))} style={inputStyle} />
          <div style={{ marginTop: '0.5rem' }}>
            <button type="submit" style={btnStyle}>Save</button>
            <button type="button" onClick={() => setShowForm(false)} style={{ ...btnStyle, marginLeft: '0.5rem', background: 'var(--surface)' }}>Cancel</button>
          </div>
        </form>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {list.length === 0 && !showForm && <p style={{ color: 'var(--muted)' }}>No medications yet. Add one to get started.</p>}
        {list.map(m => (
          <div key={m.id} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <strong>{m.name}</strong>
                {(m.dosage || m.frequency) && <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{[m.dosage, m.frequency].filter(Boolean).join(' • ')}</div>}
                {m.instructions && <div style={{ marginTop: '0.25rem', fontSize: '0.9rem' }}>{m.instructions}</div>}
              </div>
              <button onClick={() => remove(m.id)} style={{ ...btnStyle, background: 'transparent', color: 'var(--danger)', padding: '0.35rem 0.5rem' }}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const cardStyle = { padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' };
const inputStyle = { width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', marginBottom: '0.5rem' };
const btnStyle = { padding: '0.5rem 1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--accent)', color: 'white', cursor: 'pointer' };
