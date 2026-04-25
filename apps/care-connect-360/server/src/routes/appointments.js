import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const db = getDb();
  const { patientId, providerId } = req.query;
  let sql = `
    SELECT a.id, a.patient_id, a.provider_id, a.scheduled_at, a.status, a.notes, a.created_at,
           p.name as patient_name
    FROM appointments a
    JOIN patients p ON p.id = a.patient_id
    WHERE 1=1
  `;
  const params = [];
  if (patientId) { sql += ' AND a.patient_id = ?'; params.push(patientId); }
  if (providerId) { sql += ' AND a.provider_id = ?'; params.push(providerId); }
  sql += ' ORDER BY a.scheduled_at';
  const rows = db.prepare(sql).all(...params);
  res.json(rows);
});

router.post('/', (req, res) => {
  const { patient_id, provider_id, scheduled_at, notes } = req.body;
  if (!patient_id || !provider_id || !scheduled_at) return res.status(400).json({ error: 'patient_id, provider_id, scheduled_at required' });
  const db = getDb();
  const id = crypto.randomUUID();
  db.prepare('INSERT INTO appointments (id, patient_id, provider_id, scheduled_at, notes) VALUES (?, ?, ?, ?, ?)').run(id, patient_id, provider_id, scheduled_at, notes || null);
  const row = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
  res.status(201).json(row);
});

router.patch('/:id', (req, res) => {
  const { status, scheduled_at, notes } = req.body;
  const db = getDb();
  const existing = db.prepare('SELECT id FROM appointments WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Appointment not found' });
  db.prepare(`
    UPDATE appointments SET status = COALESCE(?, status), scheduled_at = COALESCE(?, scheduled_at), notes = COALESCE(?, notes) WHERE id = ?
  `).run(status, scheduled_at, notes, req.params.id);
  const row = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
  res.json(row);
});

export default router;
