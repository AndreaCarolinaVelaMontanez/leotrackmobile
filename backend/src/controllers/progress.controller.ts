import { Request, Response, NextFunction } from 'express';
import * as progressService from '../services/progress.service';

export async function createProgress(req: Request, res: Response, next: NextFunction) {
  try {
    const log = await progressService.createProgress(req.userId!, req.body);
    res.status(201).json(log);
  } catch (error) {
    next(error);
  }
}

export async function getProgressLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const userBookId = req.params.userBookId as string;
    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;
    const logs = await progressService.getProgressLogs(req.userId!, userBookId, from, to);
    res.json(logs);
  } catch (error) {
    next(error);
  }
}
