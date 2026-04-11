import { Request, Response, NextFunction } from 'express';
import * as tagsService from '../services/tags.service';

export async function setTags(req: Request, res: Response, next: NextFunction) {
  try {
    const userBookId = req.params.userBookId as string;
    const tags = await tagsService.setTags(req.userId!, userBookId, req.body);
    res.json(tags);
  } catch (error) {
    next(error);
  }
}
