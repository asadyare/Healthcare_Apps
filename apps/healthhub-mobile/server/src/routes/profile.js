import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const db = getDb();
  const row = db.prepare('SELECT id, email, name, careconnect_patient_id, medtrack_user_id FROM users WHERE id = ?').get(req.user.userId);
  if (!row) return res.status(404).json({ error: 'User not found' });
  res.json(row);
});

router.patch('/', (req, res) => {
  const { name, careconnect_patient_id, medtrack_user_id } = req.body;
  const db = getDb();
  const ccId = careconnect_patient_id != null ? String(careconnect_patient_id).trim() || null : undefined;
  const mtId = medtrack_user_id != null ? String(medtrack_user_id).trim() || null : undefined;
  db.prepare(`
    UPDATE users SET
      name = COALESCE(?, name),
      careconnect_patient_id = COALESCE(?, careconnect_patient_id),
      medtrack_user_id = COALESCE(?, medtrack_user_id)
    WHERE id = ?
  `).run(name, ccId, mtId, req.user.userId);
  const row = db.prepare('SELECT id, email, name, careconnect_patient_id, medtrack_user_id FROM users WHERE id = ?').get(req.user.userId);
  res.json(row);
});

export default router;
