import { Router } from 'express';
import * as settingsController from '../controllers/settings.controller';
import { authMiddleware } from '../middleware/auth';
import { validateBody } from '../middleware/validateBody';
import { updateSettingsSchema } from '../validators/settings';

const router = Router();

router.get('/', authMiddleware, settingsController.getSettings);
router.patch('/', authMiddleware, validateBody(updateSettingsSchema), settingsController.updateSettings);

export default router;
