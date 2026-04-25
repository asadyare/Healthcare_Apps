import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function Dashboard() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/aggregated/dashboard', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(setData)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p style={{ color: 'var(--muted)' }}>Loading...</p>;
  if (!data) return <p style={{ color: 'var(--muted)' }}>Could not load dashboard.</p>;

  const { patient, appointments = [], carePlans = [], medications = [], adherence, careconnectPatientIdSet, careconnectOk } = data;

  const scheduledAppointments = appointments
    .filter(a => a && (a.status || '').toLowerCase() === 'scheduled')
    .sort((a, b) => new Date(a.scheduled_at || 0) - new Date(b.scheduled_at || 0))
    .slice(0, 10);
  const now = new Date();
  const upcomingAppointments = scheduledAppointments.filter(a => new Date(a.scheduled_at) >= now);
  const displayList = upcomingAppointments.length > 0 ? upcomingAppointments : scheduledAppointments;

  return (
    <div>
      <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem' }}>Dashboard</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '1.25rem' }}>Your health overview from CareConnect360 and MedTrack Pro.</p>

      {patient && (
        <section style={cardStyle}>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1rem' }}>Your record</h2>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>{patient.name} {patient.email && ` · ${patient.email}`}</p>
        </section>
      )}

      <section style={cardStyle}>
        <h2 style={{ margin: '0 0 0.5rem', fontSize: '1rem' }}>Medications (MedTrack Pro)</h2>
        {adherence != null && (
          <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem' }}>Adherence: <strong style={{ color: 'var(--success)' }}>{adherence.adherencePercent}%</strong></p>
        )}
        {medications.length === 0 && <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>No medications linked.</p>}
        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
          {medications.map(m => (
            <li key={m.id} style={{ marginBottom: '0.25rem' }}>{m.name} {m.dosage && `— ${m.dosage}`}</li>
          ))}
        </ul>
      </section>

      <section style={cardStyle}>
        <h2 style={{ margin: '0 0 0.5rem', fontSize: '1rem' }}>Upcoming appointments</h2>
        {!patient && careconnectPatientIdSet && !careconnectOk && (
          <p style={{ margin: 0, color: 'var(--danger)', fontSize: '0.9rem' }}>Could not load from CareConnect360. Check that CareConnect360 is running (e.g. http://localhost:3000) and that your patient ID in Profile is correct.</p>
        )}
        {!patient && !careconnectPatientIdSet && (
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>
            Add your <strong>CareConnect360 patient ID</strong> in <Link to="/profile" style={{ color: 'var(--accent)' }}>Profile</Link> to see appointments from your provider.
          </p>
        )}
        {patient && scheduledAppointments.length === 0 && (
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>No appointments. Check that CareConnect360 is running, your patient ID is correct in Profile, and the appointment was created for this patient.</p>
        )}
        {patient && scheduledAppointments.length > 0 && displayList.length > 0 && (
          <p style={{ margin: '0 0 0.25rem', fontSize: '0.8rem', color: 'var(--muted)' }}>{upcomingAppointments.length > 0 ? 'Upcoming' : 'Scheduled'}</p>
        )}
        {displayList.map(a => (
          <p key={a.id} style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>{new Date(a.scheduled_at).toLocaleString()} — {a.status}</p>
        ))}
      </section>

      <section style={cardStyle}>
        <h2 style={{ margin: '0 0 0.5rem', fontSize: '1rem' }}>Care plans</h2>
        {carePlans.length === 0 && <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>No care plans.</p>}
        {carePlans.slice(0, 3).map(c => (
          <p key={c.id} style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}><strong>{c.title}</strong></p>
        ))}
      </section>
    </div>
  );
}

const cardStyle = {
  padding: '1rem',
  background: 'var(--surface)',
  borderRadius: 'var(--radius)',
  border: '1px solid var(--border)',
  marginBottom: '1rem',
};
