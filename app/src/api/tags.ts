import client from './client';
import { BookTag } from '../types';

export async function setTags(userBookId: string, tags: string[]): Promise<BookTag[]> {
  const { data } = await client.post(`/library/${userBookId}/tags`, { tags });
  return data;
}
