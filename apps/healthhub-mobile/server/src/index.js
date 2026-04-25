import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter, { authMiddleware } from './routes/auth.js';
import profileRouter from './routes/profile.js';
import aggregatedRouter from './routes/aggregated.js';
import { initDb } from './db.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

initDb();

app.use('/api/auth', authRouter);
app.use('/api/profile', authMiddleware, profileRouter);
app.use('/api/aggregated', authMiddleware, aggregatedRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'HealthHub Mobile' }));

app.listen(PORT, () => console.log(`HealthHub Mobile API running on http://localhost:${PORT}`));
