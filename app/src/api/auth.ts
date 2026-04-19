import client from './client';
import { User } from '../types';

interface AuthResponse {
  user: User;
  token: string;
}

export interface PendingRegistration {
  userId: string;
  email: string;
}

export async function register(name: string, email: string, password: string, country?: string): Promise<PendingRegistration> {
  const { data } = await client.post('/auth/register', { name, email, password, country });
  return data;
}

export async function verifyEmail(userId: string, code: string): Promise<AuthResponse> {
  const { data } = await client.post('/auth/verify-email', { userId, code });
  return data;
}

export async function resendVerification(userId: string): Promise<void> {
  await client.post('/auth/resend-verification', { userId });
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await client.post('/auth/login', { email: email.trim(), password });
  return data;
}

export async function logout(): Promise<void> {
  await client.post('/auth/logout');
}

export async function getMe(): Promise<User> {
  const { data } = await client.get('/auth/me');
  return data;
}

export async function forgotPassword(email: string): Promise<void> {
  await client.post('/auth/forgot-password', { email });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await client.post('/auth/reset-password', { token, newPassword });
}

export async function googleLogin(idToken: string, country?: string): Promise<AuthResponse> {
  const { data } = await client.post('/auth/google', { idToken, country });
  return data;
}
