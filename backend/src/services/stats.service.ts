import { prisma } from '../utils/prisma';

type Period = 'week' | 'month' | 'year';

function getDateRange(period: Period, ref?: string): { from: Date; to: Date } {
  const now = ref ? new Date(ref) : new Date();
  const from = new Date(now);
  const to = new Date(now);

  switch (period) {
    case 'week': {
      // ISO 8601: week starts on Monday
      const day = from.getDay();
      const distToMonday = day === 0 ? 6 : day - 1;
      from.setDate(from.getDate() - distToMonday);
      from.setHours(0, 0, 0, 0);
      to.setTime(from.getTime());
      to.setDate(to.getDate() + 6);
      to.setHours(23, 59, 59, 999);
      break;
    }
    case 'month': {
      from.setDate(1);
      from.setHours(0, 0, 0, 0);
      to.setMonth(to.getMonth() + 1, 0);
      to.setHours(23, 59, 59, 999);
      break;
    }
    case 'year': {
      from.setMonth(0, 1);
      from.setHours(0, 0, 0, 0);
      to.setMonth(11, 31);
      to.setHours(23, 59, 59, 999);
      break;
    }
  }

  return { from, to };
}

export async function getSummary(userId: string, period: Period, ref?: string) {
  const { from, to } = getDateRange(period, ref);

  // Get all userBooks for this user
  const userBooks = await prisma.userBook.findMany({
    where: { userId },
    include: { book: true },
  });

  const userBookIds = userBooks.map((ub) => ub.id);

  // Reading sessions in range
  const sessions = await prisma.readingSession.findMany({
    where: {
      userBookId: { in: userBookIds },
      startedAt: { gte: from, lte: to },
    },
  });

  // Progress logs in range
  const progressLogs = await prisma.progressLog.findMany({
    where: {
      userBookId: { in: userBookIds },
      createdAt: { gte: from, lte: to },
    },
  });

  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalPages = progressLogs.reduce((sum, p) => sum + p.pagesRead, 0);

  // Completed books in range
  const completedBooks = userBooks.filter(
    (ub) => ub.status === 'FINISHED' && ub.finishedAt && ub.finishedAt >= from && ub.finishedAt <= to
  ).length;

  // Unique days with sessions or progress
  const uniqueDays = new Set([
    ...sessions.map((s) => s.startedAt.toISOString().slice(0, 10)),
    ...progressLogs.map((p) => p.createdAt.toISOString().slice(0, 10)),
  ]).size;

  // Categories breakdown
  const categoriesMap = new Map<string, number>();
  for (const session of sessions) {
    const ub = userBooks.find((u) => u.id === session.userBookId);
    const category = ub?.book.category || 'Uncategorized';
    categoriesMap.set(category, (categoriesMap.get(category) || 0) + session.durationMinutes);
  }

  const categories = Array.from(categoriesMap.entries())
    .map(([name, minutes]) => ({ name, minutes }))
    .sort((a, b) => b.minutes - a.minutes);

  // Daily breakdown for chart
  const dailyMap = new Map<string, { minutes: number; pages: number }>();
  for (const session of sessions) {
    const day = session.startedAt.toISOString().slice(0, 10);
    const existing = dailyMap.get(day) || { minutes: 0, pages: 0 };
    existing.minutes += session.durationMinutes;
    dailyMap.set(day, existing);
  }
  for (const log of progressLogs) {
    const day = log.createdAt.toISOString().slice(0, 10);
    const existing = dailyMap.get(day) || { minutes: 0, pages: 0 };
    existing.pages += log.pagesRead;
    dailyMap.set(day, existing);
  }

  const daily = Array.from(dailyMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalMinutes,
    totalPages,
    completedBooks,
    daysActive: uniqueDays,
    categories,
    daily,
    period,
    from: from.toISOString(),
    to: to.toISOString(),
  };
}
