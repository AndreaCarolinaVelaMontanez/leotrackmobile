import { Router } from 'express';
import * as settingsController from '../controllers/settings.controller';
import { authMiddleware } from '../middleware/auth';
import { validateBody } from '../middleware/validateBody';
import { updateSettingsSchema, updateProfileSchema } from '../validators/settings';

const router = Router();

router.get('/', authMiddleware, settingsController.getSettings);
router.patch('/', authMiddleware, validateBody(updateSettingsSchema), settingsController.updateSettings);
router.put('/profile', authMiddleware, validateBody(updateProfileSchema), settingsController.updateProfile);

export default router;
