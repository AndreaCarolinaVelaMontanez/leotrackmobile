import { Request, Response, NextFunction } from 'express';
import * as exploreService from '../services/explore.service';

export async function getExplore(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await exploreService.getExploreData();
    res.json(data);
  } catch (error) {
    next(error);
  }
}
