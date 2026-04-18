import { Request, Response, NextFunction } from 'express';
import * as libraryService from '../services/library.service';

export async function addToLibrary(req: Request, res: Response, next: NextFunction) {
  try {
    const userBook = await libraryService.addToLibrary(req.userId!, req.body);
    res.status(201).json(userBook);
  } catch (error) {
    next(error);
  }
}

export async function getLibrary(req: Request, res: Response, next: NextFunction) {
  try {
    const status = req.query.status as string | undefined;
    const year = req.query.year ? Number(req.query.year) : undefined;
    const isPaginated = req.query.page !== undefined;
    const page = isPaginated ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 15;
    const result = await libraryService.getLibrary(req.userId!, status, year, page, limit);
    // Old APK expects a flat array — return paginated format only when page param is present
    res.json(isPaginated ? result : result.books);
  } catch (error) {
    next(error);
  }
}

export async function getLibraryYears(req: Request, res: Response, next: NextFunction) {
  try {
    const years = await libraryService.getLibraryYears(req.userId!);
    res.json({ years });
  } catch (error) {
    next(error);
  }
}

export async function getDetail(req: Request, res: Response, next: NextFunction) {
  try {
    const userBookId = req.params.userBookId as string;
    const userBook = await libraryService.getDetail(req.userId!, userBookId);
    res.json(userBook);
  } catch (error) {
    next(error);
  }
}

export async function deleteUserBook(req: Request, res: Response, next: NextFunction) {
  try {
    const userBookId = req.params.userBookId as string;
    await libraryService.deleteUserBook(req.userId!, userBookId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function updateUserBook(req: Request, res: Response, next: NextFunction) {
  try {
    const userBookId = req.params.userBookId as string;
    const userBook = await libraryService.updateUserBook(req.userId!, userBookId, req.body);
    res.json(userBook);
  } catch (error) {
    next(error);
  }
}
