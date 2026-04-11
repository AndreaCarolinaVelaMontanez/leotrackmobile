import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { CreateSessionInput } from '../validators/sessions';

export async function createSession(userId: string, input: CreateSessionInput) {
  const userBook = await prisma.userBook.findFirst({
    where: { id: input.userBookId, userId },
  });

  if (!userBook) {
    throw new AppError(404, 'Book not found in library');
  }

  const startedAt = new Date(input.startedAt);
  const endedAt = new Date(input.endedAt);

  if (endedAt <= startedAt) {
    throw new AppError(400, 'End time must be after start time');
  }

  const maxAllowedDate = new Date();
  maxAllowedDate.setFullYear(maxAllowedDate.getFullYear() + 5);
  if (endedAt > maxAllowedDate) {
    throw new AppError(400, 'Session date is too far in the future');
  }

  const durationMinutes = Math.round((endedAt.getTime() - startedAt.getTime()) / 60000);

  if (durationMinutes < 1) {
    throw new AppError(400, 'Session too short to record');
  }

  if (durationMinutes > 1440) {
    throw new AppError(400, 'Session duration cannot exceed 24 hours');
  }

  // DB-9: wrap create + update in a transaction so totalMinutes never drifts
  const updateData: any = { totalMinutes: { increment: durationMinutes } };
  if (userBook.status === 'WISHLIST') {
    updateData.status = 'READING';
    if (!userBook.startedAt) {
      updateData.startedAt = new Date();
    }
  }

  const [session] = await prisma.$transaction([
    prisma.readingSession.create({
      data: {
        userBookId: input.userBookId,
        startedAt,
        endedAt,
        durationMinutes,
      },
    }),
    prisma.userBook.update({
      where: { id: input.userBookId },
      data: updateData,
    }),
  ]);

  return session;
}

export async function getSessions(userId: string, userBookId: string, from?: string, to?: string) {
  const userBook = await prisma.userBook.findFirst({
    where: { id: userBookId, userId },
  });

  if (!userBook) {
    throw new AppError(404, 'Book not found in library');
  }

  const where: any = { userBookId };
  if (from || to) {
    where.startedAt = {};
    if (from) where.startedAt.gte = new Date(from);
    if (to) where.startedAt.lte = new Date(to);
  }

  return prisma.readingSession.findMany({
    where,
    orderBy: { startedAt: 'desc' },
    take: 100,
  });
}
