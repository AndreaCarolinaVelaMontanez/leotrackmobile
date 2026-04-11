import { ReadingStatus } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { AddToLibraryInput, UpdateUserBookInput } from '../validators/library';

export async function addToLibrary(userId: string, input: AddToLibraryInput) {
  const book = await prisma.book.findUnique({ where: { id: input.bookId } });
  if (!book) {
    throw new AppError(404, 'Book not found');
  }

  const existing = await prisma.userBook.findUnique({
    where: { userId_bookId: { userId, bookId: input.bookId } },
  });
  if (existing) {
    throw new AppError(409, 'Book already in library');
  }

  // Update pageCount on the book if provided and currently missing or being corrected
  if (input.pageCount && input.pageCount > 0) {
    await prisma.book.update({
      where: { id: input.bookId },
      data: { pageCount: input.pageCount },
    });
  }

  let finishedAt: Date | null = null;
  if (input.status === 'FINISHED') {
    finishedAt = input.finishedYear
      ? new Date(input.finishedYear, 0, 1)
      : new Date();
  }

  const totalPages = input.pageCount || book.pageCount || 0;

  const userBook = await prisma.userBook.create({
    data: {
      userId,
      bookId: input.bookId,
      status: input.status as ReadingStatus,
      startedAt: input.status === 'READING' ? new Date() : null,
      finishedAt,
      currentPage: input.status === 'FINISHED' && totalPages > 0 ? totalPages : 0,
    },
    include: { book: true },
  });

  // Si el libro se agrega como TERMINADO y tiene páginas, crear un progressLog
  // fechado en finishedAt para que las estadísticas del año correspondiente lo reflejen
  if (input.status === 'FINISHED' && totalPages > 0) {
    await prisma.progressLog.create({
      data: {
        userBookId: userBook.id,
        pagesRead: totalPages,
        createdAt: finishedAt ?? new Date(),
      },
    });
  }

  return userBook;
}

export async function getLibrary(userId: string, status?: string, year?: number) {
  const where: any = { userId };
  if (status) {
    where.status = status as ReadingStatus;
  }

  if (year) {
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);
    if (status === 'FINISHED') {
      where.finishedAt = { gte: start, lt: end };
    } else if (status) {
      where.createdAt = { gte: start, lt: end };
    } else {
      // ALL: match books finished that year OR added that year
      where.OR = [
        { finishedAt: { gte: start, lt: end } },
        { AND: [{ finishedAt: null }, { createdAt: { gte: start, lt: end } }] },
      ];
    }
  }

  const userBooks = await prisma.userBook.findMany({
    where,
    include: { book: true, bookTags: true },
    orderBy: { updatedAt: 'desc' },
  });

  return userBooks;
}

export async function getLibraryYears(userId: string): Promise<number[]> {
  // DB-8: extract distinct years directly in the DB — no need to load all records
  const rows = await prisma.$queryRaw<{ year: number }[]>`
    SELECT DISTINCT EXTRACT(YEAR FROM finished_at)::int AS year
    FROM user_books
    WHERE user_id = ${userId} AND finished_at IS NOT NULL
    UNION
    SELECT DISTINCT EXTRACT(YEAR FROM created_at)::int AS year
    FROM user_books
    WHERE user_id = ${userId}
    ORDER BY year DESC
  `;

  return rows.map((r) => r.year);
}

export async function getDetail(userId: string, userBookId: string) {
  const userBook = await prisma.userBook.findFirst({
    where: { id: userBookId, userId },
    include: {
      book: true,
      progressLogs: { orderBy: { createdAt: 'desc' }, take: 30 },
      readingSessions: { orderBy: { createdAt: 'desc' }, take: 30 },
      bookTags: true,
    },
  });

  if (!userBook) {
    throw new AppError(404, 'Book not found in library');
  }

  return userBook;
}

export async function deleteUserBook(userId: string, userBookId: string) {
  const userBook = await prisma.userBook.findFirst({
    where: { id: userBookId, userId },
  });

  if (!userBook) {
    throw new AppError(404, 'Book not found in library');
  }

  await prisma.userBook.delete({ where: { id: userBookId } });
}

export async function updateUserBook(userId: string, userBookId: string, input: UpdateUserBookInput) {
  const userBook = await prisma.userBook.findFirst({
    where: { id: userBookId, userId },
    include: { book: true },
  });

  if (!userBook) {
    throw new AppError(404, 'Book not found in library');
  }

  const data: any = {};

  if (input.status) {
    data.status = input.status;
    if (input.status === 'READING') {
      if (!userBook.startedAt) {
        data.startedAt = new Date();
      }
      data.finishedAt = null;
    } else if (input.status === 'FINISHED') {
      data.finishedAt = new Date();
      if (userBook.book.pageCount) {
        data.currentPage = userBook.book.pageCount;
      }
    } else if (input.status === 'WISHLIST' || input.status === 'ABANDONED') {
      data.finishedAt = null;
    }
  }

  if (input.currentPage !== undefined) {
    const cap = userBook.book.pageCount;
    data.currentPage = cap ? Math.min(input.currentPage, cap) : input.currentPage;
  }

  if (input.recommended !== undefined) {
    const effectiveStatus = (input.status as string) || userBook.status;
    if (input.recommended === true && effectiveStatus !== 'FINISHED') {
      throw new AppError(400, 'Cannot recommend a book that is not finished');
    }
    data.recommended = input.recommended;
  }

  const updated = await prisma.userBook.update({
    where: { id: userBookId },
    data,
    include: { book: true },
  });

  return updated;
}
