import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function Patients() {
  const { token } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', date_of_birth: '', address: '', medical_history: '', external_user_id: '' });
  const [error, setError] = useState('');

  const load = () => {
    fetch('/api/patients', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(setList)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    load();
  }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setError(data.error || 'Failed to add patient'); return; }
    setForm({ name: '', email: '', date_of_birth: '', address: '', medical_history: '', external_user_id: '' });
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
          <h1 style={{ margin: 0 }}>Patients</h1>
          <p style={{ color: 'var(--muted)', margin: '0.25rem 0 0' }}>Unified patient records. Select a patient to view details and MedTrack Pro medication data.</p>
        </div>
        <button type="button" onClick={() => setShowForm(!showForm)} style={btnStyle}>
          {showForm ? 'Cancel' : 'Add patient'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} style={{ padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: '1rem', maxWidth: 480 }}>
          <h2 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>New patient</h2>
          {error && <p style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}>{error}</p>}
          <label style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.9rem' }}>Name *</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="Full name" style={inputStyle} />
          <label style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.9rem' }}>Email</label>
          <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" style={inputStyle} />
          <label style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.9rem' }}>Date of birth</label>
          <input type="date" value={form.date_of_birth} onChange={e => setForm(f => ({ ...f, date_of_birth: e.target.value }))} style={inputStyle} />
          <label style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.9rem' }}>Address</label>
          <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Address" style={inputStyle} />
          <label style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.9rem' }}>Medical history</label>
          <textarea value={form.medical_history} onChange={e => setForm(f => ({ ...f, medical_history: e.target.value }))} placeholder="Notes / history" rows={2} style={inputStyle} />
          <label style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.9rem' }}>MedTrack Pro user ID (optional)</label>
          <input value={form.external_user_id} onChange={e => setForm(f => ({ ...f, external_user_id: e.target.value }))} placeholder="Link to MedTrack user for medications" style={inputStyle} />
          <div style={{ marginTop: '0.75rem' }}>
            <button type="submit" style={btnStyle}>Save patient</button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {list.length === 0 && !showForm && <p style={{ color: 'var(--muted)' }}>No patients yet. Click &quot;Add patient&quot; to create one.</p>}
        {list.map(p => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <Link to={`/patients/${p.id}`} style={{ flex: 1, color: 'inherit', textDecoration: 'none' }}>
              <strong>{p.name}</strong>
              {p.email && <span style={{ color: 'var(--muted)', marginLeft: '0.5rem' }}>{p.email}</span>}
            </Link>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); if (window.confirm(`Delete patient "${p.name}"? This will also remove their appointments and care plans.`)) { fetch(`/api/patients/${p.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }).then(r => { if (r.ok) load(); }); } }}
              style={{ padding: '0.35rem 0.6rem', fontSize: '0.85rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'transparent', color: 'var(--danger)', cursor: 'pointer' }}
              title="Delete patient"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
