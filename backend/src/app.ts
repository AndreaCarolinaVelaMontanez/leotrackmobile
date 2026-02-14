import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import booksRoutes from './routes/books.routes';
import libraryRoutes from './routes/library.routes';
import settingsRoutes from './routes/settings.routes';
import progressRoutes from './routes/progress.routes';
import sessionsRoutes from './routes/sessions.routes';
import statsRoutes from './routes/stats.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

const isProd = process.env.NODE_ENV === 'production';
const allowedOrigins = (process.env.CORS_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (!isProd) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin not allowed by CORS'));
    },
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/books', booksRoutes);
app.use('/library', libraryRoutes);
app.use('/settings', settingsRoutes);
app.use('/progress', progressRoutes);
app.use('/sessions', sessionsRoutes);
app.use('/stats', statsRoutes);

app.use(errorHandler);

export { app };
