import { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';

export default function Profile() {
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: '', careconnect_patient_id: '', medtrack_user_id: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(p => {
        setProfile(p);
        if (p) setForm({ name: p.name || '', careconnect_patient_id: p.careconnect_patient_id || '', medtrack_user_id: p.medtrack_user_id || '' });
      });
  }, [token]);

  const save = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const p = await res.json();
      setProfile(p);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  if (!profile) return <p style={{ color: 'var(--muted)' }}>Loading...</p>;

  return (
    <div>
      <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem' }}>Profile</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>Link your HealthHub account to CareConnect360 and MedTrack Pro for a unified view.</p>
      <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <label style={{ fontSize: '0.9rem' }}>Name</label>
        <input
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          style={inputStyle}
          placeholder="Your name"
        />
        <label style={{ fontSize: '0.9rem' }}>CareConnect360 patient ID</label>
        <input
          value={form.careconnect_patient_id}
          onChange={e => setForm(f => ({ ...f, careconnect_patient_id: e.target.value }))}
          style={inputStyle}
          placeholder="Paste patient ID from provider portal"
        />
        <p style={{ margin: '-0.25rem 0 0', fontSize: '0.8rem', color: 'var(--muted)' }}>Required for appointments and care plans. Your provider can give you this ID, or it’s the patient UUID from CareConnect360.</p>
        <label style={{ fontSize: '0.9rem' }}>MedTrack Pro user ID</label>
        <input
          value={form.medtrack_user_id}
          onChange={e => setForm(f => ({ ...f, medtrack_user_id: e.target.value }))}
          style={inputStyle}
          placeholder="Same as HealthHub ID if you use one account"
        />
        <button type="submit" style={{ ...inputStyle, background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
          {saved ? 'Saved' : 'Save'}
        </button>
      </form>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' };
