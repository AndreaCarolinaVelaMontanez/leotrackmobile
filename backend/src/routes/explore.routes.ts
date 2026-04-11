import { Router } from 'express';
import * as exploreController from '../controllers/explore.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, exploreController.getExplore);

export default router;
