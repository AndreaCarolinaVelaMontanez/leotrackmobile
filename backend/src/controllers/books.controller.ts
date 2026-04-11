import { Request, Response, NextFunction } from 'express';
import * as booksService from '../services/books.service';
import * as libraryService from '../services/library.service';
import { AppError } from '../middleware/errorHandler';
import { prisma } from '../utils/prisma';

export async function search(req: Request, res: Response, next: NextFunction) {
  try {
    const q = req.query.q as string;
    if (!q) {
      throw new AppError(400, 'Search query is required');
    }
    try {
      const books = await booksService.search(q);
      res.json(books);
    } catch (error) {
      console.error('Google Books search failed:', error);
      throw new AppError(502, 'Google Books search is temporarily unavailable');
    }
  } catch (error) {
    next(error);
  }
}

export async function createManual(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, finishedYear, ...bookData } = req.body;
    const book = await booksService.createManual(bookData);

    // Add to user's library — on failure, remove the orphan book
    try {
      const userBook = await libraryService.addToLibrary(req.userId!, {
        bookId: book.id,
        status: status || 'WISHLIST',
        finishedYear,
      });
      res.status(201).json(userBook);
    } catch (addError) {
      await prisma.book.delete({ where: { id: book.id } }).catch(() => {});
      throw addError;
    }
  } catch (error) {
    next(error);
  }
}
