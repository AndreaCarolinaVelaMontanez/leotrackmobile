import { prisma } from '../utils/prisma';

type Period = 'week' | 'month' | 'year';
type WeekStart = 'monday' | 'sunday';

function getDateRange(period: Period, ref?: string, weekStart: WeekStart = 'monday'): { from: Date; to: Date } {
  const now = ref ? new Date(ref + 'T12:00:00') : new Date();
  const from = new Date(now);
  const to = new Date(now);

  switch (period) {
    case 'week': {
      const day = from.getDay();
      const distToStart = weekStart === 'sunday' ? day : (day === 0 ? 6 : day - 1);
      from.setDate(from.getDate() - distToStart);
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

export async function getSummary(userId: string, period: Period, ref?: string, weekStart: WeekStart = 'monday') {
  const { from, to } = getDateRange(period, ref, weekStart);

  // Get all userBooks for this user — select only fields used in calculations
  const userBooks = await prisma.userBook.findMany({
    where: { userId },
    select: {
      id: true,
      status: true,
      finishedAt: true,
      book: { select: { category: true, pageCount: true } },
    },
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

  // Active days in period (for weekly consistency tracker)
  const activeDays = Array.from(new Set([
    ...sessions.map((s) => {
      const d = s.startedAt;
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }),
    ...progressLogs.map((p) => {
      const d = p.createdAt;
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }),
  ]));

  // Categories by period
  const categoriesMap = new Map<string, number>();
  if (period === 'year') {
    // For year: use books finished in that year, weighted by pageCount
    const finishedInRange = userBooks.filter(
      (ub) => ub.status === 'FINISHED' && ub.finishedAt && ub.finishedAt >= from && ub.finishedAt <= to
    );
    for (const ub of finishedInRange) {
      const category = ub.book.category || 'Other';
      categoriesMap.set(category, (categoriesMap.get(category) || 0) + (ub.book.pageCount || 1));
    }
  } else {
    // For week/month: use progress logs registered in range
    for (const log of progressLogs) {
      const ub = userBooks.find((u) => u.id === log.userBookId);
      const category = ub?.book.category || 'Other';
      categoriesMap.set(category, (categoriesMap.get(category) || 0) + log.pagesRead);
    }
  }
  const categories = Array.from(categoriesMap.entries())
    .map(([name, pages]) => ({ name, pages }))
    .sort((a, b) => b.pages - a.pages);

  // allTime — year-filtered when period='year', truly all-time otherwise
  let allTime: { finishedBooks: number; totalMinutes: number; totalPages: number; totalBooks: number; monthsElapsed: number };

  if (period === 'year' || period === 'month') {
    const now = new Date();
    let monthsElapsed: number;
    if (period === 'year') {
      monthsElapsed = from.getFullYear() === now.getFullYear() ? now.getMonth() + 1 : 12;
    } else {
      // month view: always 1 month
      monthsElapsed = 1;
    }
    allTime = {
      totalBooks: completedBooks,
      finishedBooks: completedBooks,
      totalMinutes,
      totalPages,
      monthsElapsed,
    };
  } else {
    // week: allTime not used (section hidden in frontend)
    allTime = {
      totalBooks: 0,
      finishedBooks: 0,
      totalMinutes: 0,
      totalPages: 0,
      monthsElapsed: 1,
    };
  }

  return {
    totalMinutes,
    totalPages,
    completedBooks,
    activeDays,
    categories,
    period,
    from: `${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, '0')}-${String(from.getDate()).padStart(2, '0')}`,
    to: `${to.getFullYear()}-${String(to.getMonth() + 1).padStart(2, '0')}-${String(to.getDate()).padStart(2, '0')}`,
    allTime,
  };
}

const MONTH_KEYS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

export async function getWeeklyActivity(userId: string, ref?: string) {
  const now = ref ? new Date(ref + 'T12:00:00') : new Date();

  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  prevMonthStart.setHours(0, 0, 0, 0);
  const currMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  currMonthEnd.setHours(23, 59, 59, 999);

  const userBooks = await prisma.userBook.findMany({
    where: { userId },
    select: { id: true },
  });
  const userBookIds = userBooks.map((ub) => ub.id);

  const sessions = await prisma.readingSession.findMany({
    where: {
      userBookId: { in: userBookIds },
      startedAt: { gte: prevMonthStart, lte: currMonthEnd },
    },
  });

  const months = [
    { year: prevMonthStart.getFullYear(), month: prevMonthStart.getMonth() },
    { year: now.getFullYear(), month: now.getMonth() },
  ];

  const result = months.map(({ year, month }) => {
    const weeks = [
      { label: 'S1', fromDay: 1, toDay: 7, minutes: 0 },
      { label: 'S2', fromDay: 8, toDay: 14, minutes: 0 },
      { label: 'S3', fromDay: 15, toDay: 21, minutes: 0 },
      { label: 'S4', fromDay: 22, toDay: 31, minutes: 0 },
    ];

    for (const session of sessions) {
      const d = session.startedAt;
      if (d.getFullYear() !== year || d.getMonth() !== month) continue;
      const day = d.getDate();
      const week = weeks.find((w) => day >= w.fromDay && day <= w.toDay);
      if (week) week.minutes += session.durationMinutes;
    }

    return {
      monthKey: MONTH_KEYS[month],
      year,
      weeks: weeks.map(({ label, minutes }) => ({ label, minutes })),
    };
  });

  return result;
}
