import { Router } from 'express';
import { getDb } from '../db.js';
import { authMiddleware } from './auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT id, name, dosage, frequency, instructions, refill_reminder_days, created_at FROM medications WHERE user_id = ? ORDER BY name').all(req.user.userId);
  res.json(rows);
});

router.post('/', (req, res) => {
  const { name, dosage, frequency, instructions, refill_reminder_days } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const db = getDb();
  const id = crypto.randomUUID();
  db.prepare(
    'INSERT INTO medications (id, user_id, name, dosage, frequency, instructions, refill_reminder_days) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(id, req.user.userId, name, dosage || null, frequency || null, instructions || null, refill_reminder_days ?? null);
  const row = db.prepare('SELECT id, name, dosage, frequency, instructions, refill_reminder_days, created_at FROM medications WHERE id = ?').get(id);
  res.status(201).json(row);
});

router.put('/:id', (req, res) => {
  const { name, dosage, frequency, instructions, refill_reminder_days } = req.body;
  const db = getDb();
  const existing = db.prepare('SELECT id FROM medications WHERE id = ? AND user_id = ?').get(req.params.id, req.user.userId);
  if (!existing) return res.status(404).json({ error: 'Medication not found' });
  db.prepare(
    'UPDATE medications SET name = COALESCE(?, name), dosage = ?, frequency = ?, instructions = ?, refill_reminder_days = ?, updated_at = datetime(\'now\') WHERE id = ?'
  ).run(name, dosage, frequency, instructions, refill_reminder_days, req.params.id);
  const row = db.prepare('SELECT id, name, dosage, frequency, instructions, refill_reminder_days, created_at, updated_at FROM medications WHERE id = ?').get(req.params.id);
  res.json(row);
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const r = db.prepare('DELETE FROM medications WHERE id = ? AND user_id = ?').run(req.params.id, req.user.userId);
  if (r.changes === 0) return res.status(404).json({ error: 'Medication not found' });
  res.status(204).send();
});

export default router;
