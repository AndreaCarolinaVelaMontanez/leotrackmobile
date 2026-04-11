import { Request, Response } from 'express';

export function getConfig(_req: Request, res: Response) {
  res.json({
    downloadUrl: process.env.APP_DOWNLOAD_URL || '',
  });
}
