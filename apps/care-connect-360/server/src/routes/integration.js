import { Router } from 'express';
import { getDb } from '../db.js';
import fetch from 'node-fetch';

const router = Router();
const INTEGRATION_KEY = process.env.INTEGRATION_API_KEY || 'shared-internal-key-change-in-prod';
const MEDTRACK_URL = process.env.MEDTRACK_API_URL || 'http://localhost:4002';

function integrationAuth(req, res, next) {
  const key = req.headers['x-api-key'] || req.query.apiKey;
  if (key !== INTEGRATION_KEY) return res.status(401).json({ error: 'Invalid integration key' });
  next();
}

router.get('/patients/:patientId', integrationAuth, (req, res) => {
  const db = getDb();
  const row = db.prepare('SELECT id, name, email, date_of_birth, address, medical_history, external_user_id FROM patients WHERE id = ?').get(req.params.patientId);
  if (!row) return res.status(404).json({ error: 'Patient not found' });
  res.json(row);
});

router.get('/appointments/:patientId', integrationAuth, (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT id, patient_id, provider_id, scheduled_at, status, notes FROM appointments WHERE patient_id = ? ORDER BY scheduled_at').all(req.params.patientId);
  res.json(rows);
});

router.get('/care-plans/:patientId', integrationAuth, (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT id, patient_id, title, description, created_at FROM care_plans WHERE patient_id = ? ORDER BY created_at DESC').all(req.params.patientId);
  res.json(rows);
});

export async function fetchMedTrackMedications(userId) {
  if (!userId) return [];
  try {
    const res = await fetch(`${MEDTRACK_URL}/api/integration/medications/${userId}`, {
      headers: { 'X-API-Key': INTEGRATION_KEY },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchMedTrackAdherence(userId) {
  if (!userId) return null;
  try {
    const res = await fetch(`${MEDTRACK_URL}/api/integration/adherence/${userId}`, {
      headers: { 'X-API-Key': INTEGRATION_KEY },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchMedTrackUserIdByEmail(email) {
  if (!email || typeof email !== 'string') return null;
  try {
    const encoded = encodeURIComponent(email.trim());
    const res = await fetch(`${MEDTRACK_URL}/api/integration/user-by-email?email=${encoded}`, {
      headers: { 'X-API-Key': INTEGRATION_KEY },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.userId || null;
  } catch {
    return null;
  }
}

export default router;
