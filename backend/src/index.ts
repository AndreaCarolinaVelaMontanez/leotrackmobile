import dotenv from 'dotenv';
dotenv.config();

import { app } from './app';
import { startSessionCleanup } from './utils/cleanExpiredSessions';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`LeoTrack API running on port ${PORT}`);
  startSessionCleanup();
});
