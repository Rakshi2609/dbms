import cors from 'cors';
import express from 'express';
import authRoutes from './routes/authRoutes.js';
import metaRoutes from './routes/metaRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import { env } from './config/env.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';

export const app = express();

app.use(
  cors({
    origin: env.clientUrl
  })
);
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/meta', metaRoutes);
app.use('/api/tasks', taskRoutes);
app.use(errorMiddleware);
