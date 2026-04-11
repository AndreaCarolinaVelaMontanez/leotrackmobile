import { Request, Response, NextFunction } from 'express';
import * as settingsService from '../services/settings.service';

export async function getSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await settingsService.getSettings(req.userId!);
    res.json(settings);
  } catch (error) {
    next(error);
  }
}

export async function updateSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await settingsService.updateSettings(req.userId!, req.body);
    res.json(settings);
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await settingsService.updateProfile(req.userId!, req.body);
    res.json(user);
  } catch (error) {
    next(error);
  }
}
