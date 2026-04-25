import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/patients/${id}/with-medications`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(setPatient)
      .finally(() => setLoading(false));
  }, [id, token]);

  const handleDelete = () => {
    if (!window.confirm(`Delete patient "${patient?.name}"? This will also remove their appointments and care plans.`)) return;
    setDeleting(true);
    fetch(`/api/patients/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      .then(r => { if (r.ok) navigate('/patients'); })
      .finally(() => setDeleting(false));
  };

  if (loading) return <p>Loading...</p>;
  if (!patient) return <p>Patient not found.</p>;

  const meds = patient.medications || [];
  const adherence = patient.adherence;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: '0 0 0.5rem' }}>{patient.name}</h1>
          <p style={{ color: 'var(--muted)', margin: 0 }}>Patient record with MedTrack Pro integration.</p>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius)', border: '1px solid var(--danger)', background: 'transparent', color: 'var(--danger)', cursor: deleting ? 'wait' : 'pointer' }}
        >
          {deleting ? 'Deleting…' : 'Delete patient'}
        </button>
      </div>
      <section style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Demographics</h2>
        <div style={{ padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <p style={{ margin: '0.25rem 0' }}>Email: {patient.email || '—'}</p>
          <p style={{ margin: '0.25rem 0' }}>DOB: {patient.date_of_birth || '—'}</p>
          <p style={{ margin: '0.25rem 0' }}>Address: {patient.address || '—'}</p>
          {patient.medical_history && <p style={{ margin: '0.5rem 0 0' }}>History: {patient.medical_history}</p>}
        </div>
      </section>
      <section style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Medications (MedTrack Pro)</h2>
        <div style={{ padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          {adherence != null && (
            <p style={{ margin: '0 0 0.5rem', color: 'var(--muted)' }}>Adherence: <strong style={{ color: 'var(--success)' }}>{adherence.adherencePercent}%</strong></p>
          )}
          {meds.length === 0 && <p style={{ color: 'var(--muted)', margin: 0 }}>No medications in MedTrack Pro for this patient.</p>}
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            {meds.map(m => (
              <li key={m.id}>{m.name} {m.dosage && `— ${m.dosage}`} {m.frequency && `(${m.frequency})`}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
