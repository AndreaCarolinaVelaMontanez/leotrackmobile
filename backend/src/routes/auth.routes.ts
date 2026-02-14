import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';
import { validateBody } from '../middleware/validateBody';
import { loginLimiter, registerLimiter } from '../middleware/rateLimiter';
import { registerSchema, loginSchema } from '../validators/auth';

const router = Router();

router.post('/register', registerLimiter, validateBody(registerSchema), authController.register);
router.post('/login', loginLimiter, validateBody(loginSchema), authController.login);
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.getMe);

export default router;
