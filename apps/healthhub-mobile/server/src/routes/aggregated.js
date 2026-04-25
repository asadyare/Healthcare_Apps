import { Router } from 'express';
import { getDb } from '../db.js';
import fetch from 'node-fetch';

const router = Router();
const INTEGRATION_KEY = process.env.INTEGRATION_API_KEY || 'shared-internal-key-change-in-prod';
const CARECONNECT_URL = process.env.CARECONNECT_API_URL || 'http://localhost:3000'; // API port (UI is 3001)
const MEDTRACK_URL = process.env.MEDTRACK_API_URL || 'http://localhost:4002';

async function getProfileLinks(userId) {
  const db = getDb();
  const row = db.prepare('SELECT careconnect_patient_id, medtrack_user_id FROM users WHERE id = ?').get(userId);
  return {
    careconnect_patient_id: row?.careconnect_patient_id,
    medtrack_user_id: row?.medtrack_user_id || userId,
  };
}

router.get('/dashboard', async (req, res) => {
  const { careconnect_patient_id, medtrack_user_id } = await getProfileLinks(req.user.userId);

  let patient = null;
  let appointments = [];
  let carePlans = [];
  let medications = [];
  let adherence = null;
  let careconnectOk = false;

  if (careconnect_patient_id) {
    const patientId = String(careconnect_patient_id).trim();
    try {
      const [pRes, aRes, cRes] = await Promise.all([
        fetch(`${CARECONNECT_URL}/api/integration/patients/${patientId}`, { headers: { 'X-API-Key': INTEGRATION_KEY } }),
        fetch(`${CARECONNECT_URL}/api/integration/appointments/${patientId}`, { headers: { 'X-API-Key': INTEGRATION_KEY } }),
        fetch(`${CARECONNECT_URL}/api/integration/care-plans/${patientId}`, { headers: { 'X-API-Key': INTEGRATION_KEY } }),
      ]);
      if (pRes.ok) patient = await pRes.json();
      if (aRes.ok) appointments = await aRes.json();
      if (cRes.ok) carePlans = await cRes.json();
      careconnectOk = pRes.ok;
    } catch (_) {}
  }

  try {
    const [mRes, adhRes] = await Promise.all([
      fetch(`${MEDTRACK_URL}/api/integration/medications/${medtrack_user_id}`, { headers: { 'X-API-Key': INTEGRATION_KEY } }),
      fetch(`${MEDTRACK_URL}/api/integration/adherence/${medtrack_user_id}`, { headers: { 'X-API-Key': INTEGRATION_KEY } }),
    ]);
    if (mRes.ok) medications = await mRes.json();
    if (adhRes.ok) adherence = await adhRes.json();
  } catch (_) {}

  res.json({
    patient,
    appointments,
    carePlans,
    medications,
    adherence,
    careconnectPatientIdSet: !!careconnect_patient_id,
    careconnectOk,
  });
});

export default router;
