import client from './client';
import { Book, UserBook } from '../types';

export async function searchBooks(query: string): Promise<Book[]> {
  const { data } = await client.get('/books/search', { params: { q: query } });
  return data;
}

export async function createManualBook(input: {
  title: string;
  author: string;
  category?: string;
  pageCount: number;
  language?: string;
  status?: string;
}): Promise<UserBook> {
  const { data } = await client.post('/books/manual', input);
  return data;
}
