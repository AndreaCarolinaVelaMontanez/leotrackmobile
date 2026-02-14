import { Router } from 'express';
import * as progressController from '../controllers/progress.controller';
import { authMiddleware } from '../middleware/auth';
import { validateBody } from '../middleware/validateBody';
import { validateQuery } from '../middleware/validateQuery';
import { createProgressSchema } from '../validators/progress';
import { dateRangeQuerySchema } from '../validators/queryParams';

const router = Router();

router.post('/', authMiddleware, validateBody(createProgressSchema), progressController.createProgress);
router.get('/:userBookId', authMiddleware, validateQuery(dateRangeQuerySchema), progressController.getProgressLogs);

export default router;
