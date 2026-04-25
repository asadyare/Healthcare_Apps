import { Router } from 'express';
import { getDb } from '../db.js';
import { authMiddleware } from './auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT s.id, s.medication_id, s.time_of_day, s.days_mask, m.name as medication_name
    FROM schedules s
    JOIN medications m ON m.id = s.medication_id
    WHERE m.user_id = ?
    ORDER BY s.time_of_day
  `).all(req.user.userId);
  res.json(rows);
});

router.post('/', (req, res) => {
  const { medication_id, time_of_day, days_mask } = req.body;
  if (!medication_id || !time_of_day) return res.status(400).json({ error: 'medication_id and time_of_day required' });
  const db = getDb();
  const med = db.prepare('SELECT id FROM medications WHERE id = ? AND user_id = ?').get(medication_id, req.user.userId);
  if (!med) return res.status(404).json({ error: 'Medication not found' });
  const id = crypto.randomUUID();
  db.prepare('INSERT INTO schedules (id, medication_id, time_of_day, days_mask) VALUES (?, ?, ?, ?)').run(id, medication_id, time_of_day, days_mask ?? 127);
  const row = db.prepare('SELECT s.id, s.medication_id, s.time_of_day, s.days_mask FROM schedules s WHERE s.id = ?').get(id);
  res.status(201).json(row);
});

router.get('/logs', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT l.id, l.medication_id, l.scheduled_at, l.taken_at, l.skipped, m.name as medication_name
    FROM dosage_logs l
    JOIN medications m ON m.id = l.medication_id
    WHERE m.user_id = ?
    ORDER BY l.scheduled_at DESC
    LIMIT 100
  `).all(req.user.userId);
  res.json(rows);
});

router.post('/logs', (req, res) => {
  const { medication_id, scheduled_at, taken_at, skipped } = req.body;
  if (!medication_id || !scheduled_at) return res.status(400).json({ error: 'medication_id and scheduled_at required' });
  const db = getDb();
  const med = db.prepare('SELECT id FROM medications WHERE id = ? AND user_id = ?').get(medication_id, req.user.userId);
  if (!med) return res.status(404).json({ error: 'Medication not found' });
  const id = crypto.randomUUID();
  db.prepare('INSERT INTO dosage_logs (id, medication_id, scheduled_at, taken_at, skipped) VALUES (?, ?, ?, ?, ?)').run(id, medication_id, scheduled_at, taken_at || null, skipped ? 1 : 0);
  const row = db.prepare('SELECT * FROM dosage_logs WHERE id = ?').get(id);
  res.status(201).json(row);
});

export default router;
