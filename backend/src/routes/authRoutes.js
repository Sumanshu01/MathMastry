import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { validateBody } from '../middleware/validate.js';
import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validations/schemas.js';

const router = Router();

router.post('/register', authRateLimiter, validateBody(registerSchema), authController.register);
router.post('/verify-email', authRateLimiter, validateBody(verifyOtpSchema), authController.verifyEmail);
router.post('/login', authRateLimiter, validateBody(loginSchema), authController.login);
router.post('/login/verify', authRateLimiter, validateBody(verifyOtpSchema), authController.loginVerify);
router.post('/resend-otp', authRateLimiter, validateBody(resendOtpSchema), authController.resendOtp);
router.post('/forgot-password', authRateLimiter, validateBody(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authRateLimiter, validateBody(resetPasswordSchema), authController.resetPassword);
router.post('/logout', authController.logout);

export default router;
