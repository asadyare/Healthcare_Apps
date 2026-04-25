import { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';

export default function Schedules() {
  const { token } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ medication_id: '', time_of_day: '08:00' });
  const [error, setError] = useState('');

  const load = async () => {
    const [sRes, mRes] = await Promise.all([
      fetch('/api/schedules', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('/api/medications', { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    if (sRes.ok) setSchedules(await sRes.json());
    if (mRes.ok) setMedications(await mRes.json());
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    load();
  }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.medication_id) { setError('Select a medication'); return; }
    const res = await fetch('/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ medication_id: form.medication_id, time_of_day: form.time_of_day }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setError(data.error || 'Failed to add schedule'); return; }
    setForm({ medication_id: '', time_of_day: '08:00' });
    setShowForm(false);
    setLoading(true);
    load();
  };

  const inputStyle = { width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' };
  const btnStyle = { padding: '0.5rem 1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--accent)', color: 'white', cursor: 'pointer', fontWeight: 600 };

  if (loading) return <p>Loading...</p>;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Medication schedules</h1>
          <p style={{ color: 'var(--muted)', margin: '0.25rem 0 0' }}>When to take your medications.</p>
        </div>
        <button type="button" onClick={() => setShowForm(!showForm)} style={btnStyle} disabled={medications.length === 0}>
          {showForm ? 'Cancel' : 'Add schedule'}
        </button>
      </div>

      {medications.length === 0 && (
        <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>Add medications first in the <a href="/medications" style={{ color: 'var(--accent)' }}>Medications</a> page, then you can set reminder times here.</p>
      )}

      {showForm && medications.length > 0 && (
        <form onSubmit={submit} style={{ padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: '1rem', maxWidth: 400 }}>
          <h2 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>New schedule</h2>
          {error && <p style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}>{error}</p>}
          <label style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.9rem' }}>Medication *</label>
          <select value={form.medication_id} onChange={e => setForm(f => ({ ...f, medication_id: e.target.value }))} required style={inputStyle}>
            <option value="">Select medication</option>
            {medications.map(m => (
              <option key={m.id} value={m.id}>{m.name} {m.dosage && `(${m.dosage})`}</option>
            ))}
          </select>
          <label style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.9rem' }}>Time *</label>
          <input type="time" value={form.time_of_day} onChange={e => setForm(f => ({ ...f, time_of_day: e.target.value }))} style={inputStyle} />
          <div style={{ marginTop: '0.75rem' }}>
            <button type="submit" style={btnStyle}>Save schedule</button>
          </div>
        </form>
      )}

      {schedules.length === 0 && !showForm && (
        <p style={{ color: 'var(--muted)' }}>No schedules yet. Click &quot;Add schedule&quot; to set when to take each medication.</p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {schedules.map(s => (
          <div key={s.id} style={{ padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <strong>{s.medication_name}</strong> — {s.time_of_day}
          </div>
        ))}
      </div>
    </div>
  );
}
