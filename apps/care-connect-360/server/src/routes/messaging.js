import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT m.id, m.sender_id, m.recipient_id, m.subject, m.body, m.read_at, m.created_at
    FROM messages m
    WHERE m.recipient_id = ? OR m.sender_id = ?
    ORDER BY m.created_at DESC
  `).all(req.user.userId, req.user.userId);
  res.json(rows);
});

router.post('/', (req, res) => {
  const { recipient_id, subject, body } = req.body;
  if (!recipient_id || !body) return res.status(400).json({ error: 'recipient_id and body required' });
  const db = getDb();
  const id = crypto.randomUUID();
  db.prepare('INSERT INTO messages (id, sender_id, recipient_id, subject, body) VALUES (?, ?, ?, ?, ?)').run(id, req.user.userId, recipient_id, subject || null, body);
  const row = db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
  res.status(201).json(row);
});

router.patch('/:id/read', (req, res) => {
  const db = getDb();
  db.prepare('UPDATE messages SET read_at = datetime(\'now\') WHERE id = ? AND recipient_id = ?').run(req.params.id, req.user.userId);
  const row = db.prepare('SELECT * FROM messages WHERE id = ?').get(req.params.id);
  res.json(row || {});
});

export default router;
