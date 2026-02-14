import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { CreateProgressInput } from '../validators/progress';

export async function createProgress(userId: string, input: CreateProgressInput) {
  const userBook = await prisma.userBook.findFirst({
    where: { id: input.userBookId, userId },
    include: { book: true },
  });

  if (!userBook) {
    throw new AppError(404, 'Book not found in library');
  }

  const log = await prisma.progressLog.create({
    data: {
      userBookId: input.userBookId,
      pagesRead: input.pagesRead,
    },
  });

  // Update currentPage capped at pageCount
  let newPage = userBook.currentPage + input.pagesRead;
  if (userBook.book.pageCount) {
    newPage = Math.min(newPage, userBook.book.pageCount);
  }

  const updateData: any = { currentPage: newPage };

  // Auto-start: if book is in WISHLIST, transition to READING
  if (userBook.status === 'WISHLIST') {
    updateData.status = 'READING';
    if (!userBook.startedAt) {
      updateData.startedAt = new Date();
    }
  }

  // Auto-finish when reaching the last page
  if (userBook.book.pageCount && newPage >= userBook.book.pageCount && userBook.status !== 'FINISHED') {
    updateData.status = 'FINISHED';
    updateData.finishedAt = new Date();
  }

  await prisma.userBook.update({
    where: { id: input.userBookId },
    data: updateData,
  });

  return log;
}

export async function getProgressLogs(userId: string, userBookId: string, from?: string, to?: string) {
  const userBook = await prisma.userBook.findFirst({
    where: { id: userBookId, userId },
  });

  if (!userBook) {
    throw new AppError(404, 'Book not found in library');
  }

  const where: any = { userBookId };
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }

  return prisma.progressLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
}
