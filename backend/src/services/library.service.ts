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

  const userBook = await prisma.userBook.create({
    data: {
      userId,
      bookId: input.bookId,
      status: input.status as ReadingStatus,
      startedAt: input.status === 'READING' ? new Date() : null,
      finishedAt: input.status === 'FINISHED' ? new Date() : null,
    },
    include: { book: true },
  });

  return userBook;
}

export async function getLibrary(userId: string, status?: string) {
  const where: any = { userId };
  if (status) {
    where.status = status as ReadingStatus;
  }

  const userBooks = await prisma.userBook.findMany({
    where,
    include: { book: true },
    orderBy: { updatedAt: 'desc' },
  });

  return userBooks;
}

export async function getDetail(userId: string, userBookId: string) {
  const userBook = await prisma.userBook.findFirst({
    where: { id: userBookId, userId },
    include: {
      book: true,
      progressLogs: { orderBy: { createdAt: 'desc' }, take: 10 },
      readingSessions: { orderBy: { createdAt: 'desc' }, take: 10 },
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

  const updated = await prisma.userBook.update({
    where: { id: userBookId },
    data,
    include: { book: true },
  });

  return updated;
}
