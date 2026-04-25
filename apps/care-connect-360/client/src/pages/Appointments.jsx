import { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';

export default function Appointments() {
  const { token, user } = useAuth();
  const [list, setList] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ patient_id: '', scheduled_at: '', notes: '' });
  const [error, setError] = useState('');

  const load = () => {
    fetch('/api/appointments', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(setList)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    load();
  }, [token]);

  useEffect(() => {
    fetch('/api/patients', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(setPatients);
  }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.patient_id || !form.scheduled_at) { setError('Select a patient and date/time'); return; }
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        patient_id: form.patient_id,
        provider_id: user?.id,
        scheduled_at: form.scheduled_at,
        notes: form.notes || undefined,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setError(data.error || 'Failed to add appointment'); return; }
    setForm({ patient_id: '', scheduled_at: '', notes: '' });
    setShowForm(false);
    load();
  };

  const inputStyle = { width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' };
  const btnStyle = { padding: '0.5rem 1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--accent)', color: 'white', cursor: 'pointer', fontWeight: 600 };

  if (loading) return <p>Loading...</p>;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Appointments</h1>
          <p style={{ color: 'var(--muted)', margin: '0.25rem 0 0' }}>Scheduled patient visits.</p>
        </div>
        <button type="button" onClick={() => setShowForm(!showForm)} style={btnStyle} disabled={patients.length === 0}>
          {showForm ? 'Cancel' : 'Add appointment'}
        </button>
      </div>

      {patients.length === 0 && (
        <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>Add <a href="/patients" style={{ color: 'var(--accent)' }}>patients</a> first, then you can schedule appointments.</p>
      )}

      {showForm && patients.length > 0 && (
        <form onSubmit={submit} style={{ padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: '1rem', maxWidth: 480 }}>
          <h2 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>New appointment</h2>
          {error && <p style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}>{error}</p>}
          <label style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.9rem' }}>Patient *</label>
          <select value={form.patient_id} onChange={e => setForm(f => ({ ...f, patient_id: e.target.value }))} required style={inputStyle}>
            <option value="">Select patient</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.name} {p.email && `(${p.email})`}</option>
            ))}
          </select>
          <label style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.9rem' }}>Date & time *</label>
          <input type="datetime-local" value={form.scheduled_at} onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))} required style={inputStyle} />
          <label style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.9rem' }}>Notes</label>
          <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes" rows={2} style={inputStyle} />
          <div style={{ marginTop: '0.75rem' }}>
            <button type="submit" style={btnStyle}>Save appointment</button>
          </div>
        </form>
      )}

      {list.length === 0 && !showForm && <p style={{ color: 'var(--muted)' }}>No appointments. Click &quot;Add appointment&quot; to schedule one.</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {list.map(a => (
          <div key={a.id} style={{ padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <strong>{a.patient_name}</strong> — {new Date(a.scheduled_at).toLocaleString()} — {a.status}
          </div>
        ))}
      </div>
    </div>
  );
}
