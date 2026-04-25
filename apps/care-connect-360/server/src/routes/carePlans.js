import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const { patientId } = req.query;
  const db = getDb();
  let sql = 'SELECT id, patient_id, title, description, created_by, created_at FROM care_plans WHERE 1=1';
  const params = [];
  if (patientId) { sql += ' AND patient_id = ?'; params.push(patientId); }
  sql += ' ORDER BY created_at DESC';
  const rows = db.prepare(sql).all(...params);
  res.json(rows);
});

router.post('/', (req, res) => {
  const { patient_id, title, description } = req.body;
  if (!patient_id || !title) return res.status(400).json({ error: 'patient_id and title required' });
  const db = getDb();
  const id = crypto.randomUUID();
  db.prepare('INSERT INTO care_plans (id, patient_id, title, description, created_by) VALUES (?, ?, ?, ?, ?)').run(id, patient_id, title, description || null, req.user.userId);
  const row = db.prepare('SELECT * FROM care_plans WHERE id = ?').get(id);
  res.status(201).json(row);
});

export default router;
