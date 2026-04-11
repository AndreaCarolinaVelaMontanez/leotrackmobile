import { Router } from 'express';
import * as statsController from '../controllers/stats.controller';
import { authMiddleware } from '../middleware/auth';
import { validateQuery } from '../middleware/validateQuery';
import { statsQuerySchema } from '../validators/queryParams';

const router = Router();

router.get('/', authMiddleware, validateQuery(statsQuerySchema), statsController.getSummary);
router.get('/weekly-activity', authMiddleware, statsController.getWeeklyActivity);

export default router;
