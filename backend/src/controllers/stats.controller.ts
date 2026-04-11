import { Request, Response, NextFunction } from 'express';
import * as statsService from '../services/stats.service';

export async function getSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const period = req.query.period as string;
    const ref = req.query.ref as string | undefined;
    const weekStart = (req.query.weekStart as string) === 'sunday' ? 'sunday' : 'monday';
    const summary = await statsService.getSummary(
      req.userId!,
      period as 'week' | 'month' | 'year',
      ref,
      weekStart as 'monday' | 'sunday'
    );
    res.json(summary);
  } catch (error) {
    next(error);
  }
}

export async function getWeeklyActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const ref = req.query.ref as string | undefined;
    const data = await statsService.getWeeklyActivity(req.userId!, ref);
    res.json(data);
  } catch (error) {
    next(error);
  }
}
