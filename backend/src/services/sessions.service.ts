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

  const durationMinutes = Math.round((endedAt.getTime() - startedAt.getTime()) / 60000);

  const session = await prisma.readingSession.create({
    data: {
      userBookId: input.userBookId,
      startedAt,
      endedAt,
      durationMinutes,
    },
  });

  // Auto-start: if book is in WISHLIST, transition to READING
  const updateData: any = { totalMinutes: { increment: durationMinutes } };
  if (userBook.status === 'WISHLIST') {
    updateData.status = 'READING';
    if (!userBook.startedAt) {
      updateData.startedAt = new Date();
    }
  }

  await prisma.userBook.update({
    where: { id: input.userBookId },
    data: updateData,
  });

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
  });
}
