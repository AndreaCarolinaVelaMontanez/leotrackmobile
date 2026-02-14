import client from './client';
import { ReadingSession } from '../types';

export async function createSession(
  userBookId: string,
  startedAt: string,
  endedAt: string
): Promise<ReadingSession> {
  const { data } = await client.post('/sessions', { userBookId, startedAt, endedAt });
  return data;
}

export async function getSessions(userBookId: string): Promise<ReadingSession[]> {
  const { data } = await client.get(`/sessions/${userBookId}`);
  return data;
}
