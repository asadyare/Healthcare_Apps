import { Router } from 'express';
import { getDb } from '../db.js';
import { fetchMedTrackMedications, fetchMedTrackAdherence, fetchMedTrackUserIdByEmail } from './integration.js';

const router = Router();

router.get('/', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT id, name, email, date_of_birth, address, medical_history, created_at
    FROM patients
    ORDER BY name
  `).all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const { name, email, date_of_birth, address, medical_history, external_user_id } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const db = getDb();
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO patients (id, provider_id, external_user_id, name, email, date_of_birth, address, medical_history)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, req.user.userId, external_user_id || null, name, email || null, date_of_birth || null, address || null, medical_history || null);
  const row = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
  res.status(201).json(row);
});

router.get('/:id/with-medications', async (req, res) => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Patient not found' });
  let medTrackUserId = row.external_user_id || null;
  if (!medTrackUserId && row.email) {
    medTrackUserId = await fetchMedTrackUserIdByEmail(row.email);
  }
  const [medications, adherence] = medTrackUserId
    ? await Promise.all([
        fetchMedTrackMedications(medTrackUserId),
        fetchMedTrackAdherence(medTrackUserId),
      ])
    : [[], null];
  res.json({ ...row, medications, adherence });
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Patient not found' });
  res.json(row);
});

router.put('/:id', (req, res) => {
  const { name, email, date_of_birth, address, medical_history } = req.body;
  const db = getDb();
  const existing = db.prepare('SELECT id FROM patients WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Patient not found' });
  db.prepare(`
    UPDATE patients SET
      name = COALESCE(?, name), email = ?, date_of_birth = ?, address = ?, medical_history = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(name, email, date_of_birth, address, medical_history, req.params.id);
  const row = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
  res.json(row);
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM patients WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Patient not found' });
  db.prepare('DELETE FROM appointments WHERE patient_id = ?').run(req.params.id);
  db.prepare('DELETE FROM care_plans WHERE patient_id = ?').run(req.params.id);
  db.prepare('DELETE FROM patients WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

export default router;
