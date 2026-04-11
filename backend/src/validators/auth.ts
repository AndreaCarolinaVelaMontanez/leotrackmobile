import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().trim().toLowerCase().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  country: z.string().max(100).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email'),
});

export const resetPasswordSchema = z.object({
  token: z.string().regex(/^\d{6}$/, 'Invalid code'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const googleTokenSchema = z.object({
  idToken: z.string().min(1, 'ID token is required'),
  country: z.string().optional(),
});

export type GoogleTokenInput = z.infer<typeof googleTokenSchema>;

export const verifyEmailSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  code: z.string().regex(/^\d{6}$/, 'Code must be 6 digits'),
});

export const resendVerificationSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
