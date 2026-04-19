import client from './client';
import { UserBook, UserBookDetail } from '../types';

export interface LibraryPage {
  books: UserBook[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export async function getLibrary(status?: string, year?: number, page = 1, limit = 10): Promise<LibraryPage> {
  const params: any = { page, limit };
  if (status) params.status = status;
  if (year) params.year = year;
  const { data } = await client.get('/library', { params });
  return data;
}

export async function getLibraryYears(): Promise<number[]> {
  const { data } = await client.get('/library/years');
  return data.years;
}

export async function addToLibrary(bookId: string, status?: string, finishedYear?: number, pageCount?: number): Promise<UserBook> {
  const { data } = await client.post('/library', { bookId, status, finishedYear, pageCount });
  return data;
}

export async function getBookDetail(userBookId: string): Promise<UserBookDetail> {
  const { data } = await client.get(`/library/${userBookId}`);
  return data;
}

export async function updateUserBook(
  userBookId: string,
  input: { status?: string; currentPage?: number; recommended?: boolean }
): Promise<UserBook> {
  const { data } = await client.patch(`/library/${userBookId}`, input);
  return data;
}

export async function deleteUserBook(userBookId: string): Promise<void> {
  await client.delete(`/library/${userBookId}`);
}
