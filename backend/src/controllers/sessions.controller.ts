import { Request, Response, NextFunction } from 'express';
import * as sessionsService from '../services/sessions.service';

export async function createSession(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await sessionsService.createSession(req.userId!, req.body);
    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
}

export async function getSessions(req: Request, res: Response, next: NextFunction) {
  try {
    const userBookId = req.params.userBookId as string;
    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;
    const sessions = await sessionsService.getSessions(req.userId!, userBookId, from, to);
    res.json(sessions);
  } catch (error) {
    next(error);
  }
}
