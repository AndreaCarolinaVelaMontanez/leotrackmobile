import { Router } from 'express';
import * as sessionsController from '../controllers/sessions.controller';
import { authMiddleware } from '../middleware/auth';
import { validateBody } from '../middleware/validateBody';
import { validateQuery } from '../middleware/validateQuery';
import { createSessionSchema } from '../validators/sessions';
import { dateRangeQuerySchema } from '../validators/queryParams';

const router = Router();

router.post('/', authMiddleware, validateBody(createSessionSchema), sessionsController.createSession);
router.get('/:userBookId', authMiddleware, validateQuery(dateRangeQuerySchema), sessionsController.getSessions);

export default router;
