import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter, { authMiddleware } from './routes/auth.js';
import patientsRouter from './routes/patients.js';
import appointmentsRouter from './routes/appointments.js';
import carePlansRouter from './routes/carePlans.js';
import messagingRouter from './routes/messaging.js';
import integrationRouter from './routes/integration.js';
import { initDb } from './db.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

initDb();

app.use('/api/auth', authRouter);
app.use('/api/patients', authMiddleware, patientsRouter);
app.use('/api/appointments', authMiddleware, appointmentsRouter);
app.use('/api/care-plans', authMiddleware, carePlansRouter);
app.use('/api/messaging', authMiddleware, messagingRouter);
app.use('/api/integration', integrationRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'CareConnect360' }));

app.listen(PORT, () => console.log(`CareConnect360 API running on http://localhost:${PORT}`));
