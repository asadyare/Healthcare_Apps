import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { getDb } from '../db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'healthhub-secret-change-in-prod';

export function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

router.post('/register', (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const db = getDb();
  const id = crypto.randomUUID();
  const password_hash = Buffer.from(password).toString('base64');
  try {
    db.prepare('INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)').run(id, email, password_hash, name || '');
    const token = jwt.sign({ userId: id, email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id, email, name: name || '' } });
  } catch (e) {
    if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ error: 'Email already registered' });
    throw e;
  }
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const db = getDb();
  const row = db.prepare('SELECT id, email, name, password_hash FROM users WHERE email = ?').get(email);
  if (!row || row.password_hash !== Buffer.from(password).toString('base64')) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ userId: row.id, email: row.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: row.id, email: row.email, name: row.name || '' } });
});

export default router;
