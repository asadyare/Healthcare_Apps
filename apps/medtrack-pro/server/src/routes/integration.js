import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();
const INTEGRATION_KEY = process.env.INTEGRATION_API_KEY || 'shared-internal-key-change-in-prod';

function integrationAuth(req, res, next) {
  const key = req.headers['x-api-key'] || req.query.apiKey;
  if (key !== INTEGRATION_KEY) return res.status(401).json({ error: 'Invalid integration key' });
  next();
}

router.use(integrationAuth);

router.get('/user-by-email', (req, res) => {
  const email = req.query.email;
  if (!email || typeof email !== 'string') return res.status(400).json({ error: 'email query required' });
  const db = getDb();
  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email.trim());
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ userId: user.id });
});

router.get('/medications/:userId', (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT id, user_id, name, dosage, frequency, instructions, refill_reminder_days FROM medications WHERE user_id = ?').all(req.params.userId);
  res.json(rows);
});

router.get('/adherence/:userId', (req, res) => {
  const db = getDb();
  const logs = db.prepare(`
    SELECT l.taken_at, l.skipped
    FROM dosage_logs l
    JOIN medications m ON m.id = l.medication_id
    WHERE m.user_id = ?
  `).all(req.params.userId);
  const total = logs.length;
  const taken = logs.filter(l => l.taken_at).length;
  const skipped = logs.filter(l => l.skipped).length;
  res.json({ total, taken, skipped, adherencePercent: total ? Math.round((taken / total) * 100) : 0 });
});

router.post('/medications', (req, res) => {
  const { user_id, name, dosage, frequency, instructions, refill_reminder_days } = req.body;
  if (!user_id || !name) return res.status(400).json({ error: 'user_id and name required' });
  const db = getDb();
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(user_id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const id = crypto.randomUUID();
  db.prepare(
    'INSERT INTO medications (id, user_id, name, dosage, frequency, instructions, refill_reminder_days) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(id, user_id, name, dosage || null, frequency || null, instructions || null, refill_reminder_days ?? null);
  const row = db.prepare('SELECT id, user_id, name, dosage, frequency, instructions, refill_reminder_days FROM medications WHERE id = ?').get(id);
  res.status(201).json(row);
});

export default router;
