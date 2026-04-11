import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from './errorHandler';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError(401, 'Missing or invalid authorization header');
    }

    const token = authHeader.slice(7);
    const session = await prisma.authSession.findUnique({
      where: { token },
    });

    if (!session) {
      throw new AppError(401, 'Invalid or expired token');
    }

    if (session.expiresAt < new Date()) {
      prisma.authSession.delete({ where: { token } }).catch(() => {});
      throw new AppError(401, 'Invalid or expired token');
    }

    req.userId = session.userId;
    next();
  } catch (error) {
    next(error);
  }
}
