import { Request, Response, NextFunction } from 'express';
import * as booksService from '../services/books.service';
import * as libraryService from '../services/library.service';
import { AppError } from '../middleware/errorHandler';

export async function search(req: Request, res: Response, next: NextFunction) {
  try {
    const q = req.query.q as string;
    if (!q) {
      throw new AppError(400, 'Search query is required');
    }
    const books = await booksService.search(q);
    res.json(books);
  } catch (error) {
    next(error);
  }
}

export async function createManual(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, ...bookData } = req.body;
    const book = await booksService.createManual(bookData);

    // Also add to user's library
    const userBook = await libraryService.addToLibrary(req.userId!, {
      bookId: book.id,
      status: status || 'WISHLIST',
    });

    res.status(201).json(userBook);
  } catch (error) {
    next(error);
  }
}
