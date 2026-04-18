import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';
import { validateBody } from '../middleware/validateBody';
import { loginLimiter, loginEmailLimiter, registerLimiter, resetPasswordLimiter } from '../middleware/rateLimiter';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  googleTokenSchema,
  verifyEmailSchema,
  resendVerificationSchema,
} from '../validators/auth';

const router = Router();

router.post('/register', registerLimiter, validateBody(registerSchema), authController.register);
router.post('/verify-email', registerLimiter, validateBody(verifyEmailSchema), authController.verifyEmail);
router.post('/resend-verification', registerLimiter, validateBody(resendVerificationSchema), authController.resendVerification);
router.post('/google', loginLimiter, validateBody(googleTokenSchema), authController.googleLogin);
router.post('/login', loginLimiter, loginEmailLimiter, validateBody(loginSchema), authController.login);
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.getMe);
router.post('/forgot-password', resetPasswordLimiter, validateBody(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', resetPasswordLimiter, validateBody(resetPasswordSchema), authController.resetPassword);

export default router;
