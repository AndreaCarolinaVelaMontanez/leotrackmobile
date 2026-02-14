import { prisma } from './prisma';

const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function startSessionCleanup() {
  async function cleanup() {
    try {
      const result = await prisma.authSession.deleteMany({
        where: { expiresAt: { lt: new Date() } },
      });
      if (result.count > 0) {
        console.log(`Cleaned up ${result.count} expired session(s)`);
      }
    } catch (error) {
      console.error('Session cleanup error:', error);
    }
  }

  cleanup();
  setInterval(cleanup, CLEANUP_INTERVAL_MS);
}
