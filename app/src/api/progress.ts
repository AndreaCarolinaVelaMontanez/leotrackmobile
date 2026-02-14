import client from './client';
import { ProgressLog } from '../types';

export async function createProgress(userBookId: string, pagesRead: number): Promise<ProgressLog> {
  const { data } = await client.post('/progress', { userBookId, pagesRead });
  return data;
}

export async function getProgressLogs(userBookId: string): Promise<ProgressLog[]> {
  const { data } = await client.get(`/progress/${userBookId}`);
  return data;
}
