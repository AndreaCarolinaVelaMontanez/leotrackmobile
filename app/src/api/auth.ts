import client from './client';
import { User } from '../types';

interface AuthResponse {
  user: User;
  token: string;
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  const { data } = await client.post('/auth/register', { name, email, password });
  return data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await client.post('/auth/login', { email, password });
  return data;
}

export async function logout(): Promise<void> {
  await client.post('/auth/logout');
}

export async function getMe(): Promise<User> {
  const { data } = await client.get('/auth/me');
  return data;
}
