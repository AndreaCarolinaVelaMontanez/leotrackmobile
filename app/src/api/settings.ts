import client from './client';
import { UserSettings } from '../types';

export async function getSettings(): Promise<UserSettings> {
  const { data } = await client.get('/settings');
  return data;
}

export async function updateSettings(input: {
  language?: 'EN' | 'ES';
  theme?: 'LIGHT' | 'DARK';
}): Promise<UserSettings> {
  const { data } = await client.patch('/settings', input);
  return data;
}

export async function updateProfile(name: string, country?: string): Promise<{ id: string; name: string; email: string; country?: string | null }> {
  const { data } = await client.put('/settings/profile', { name, country });
  return data;
}
