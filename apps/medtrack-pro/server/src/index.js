import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import medicationsRouter from './routes/medications.js';
import schedulesRouter from './routes/schedules.js';
import authRouter from './routes/auth.js';
import integrationRouter from './routes/integration.js';
import { initDb } from './db.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4002;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

initDb();

app.use('/api/auth', authRouter);
app.use('/api/medications', medicationsRouter);
app.use('/api/schedules', schedulesRouter);
app.use('/api/integration', integrationRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'MedTrack Pro' }));

const server = app.listen(PORT, () => console.log(`MedTrack Pro API running on http://localhost:${PORT}`));

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\nPort ${PORT} is already in use. Either:\n  1) Stop the other process using port ${PORT}\n  2) Use a different port: set PORT=4003 (or another number) and restart\n`);
    console.error('On Windows, find what is using the port:  netstat -ano | findstr :' + PORT);
    console.error('Then kill it:  taskkill /PID <PID> /F\n');
  } else {
    console.error(err);
  }
  process.exit(1);
});
