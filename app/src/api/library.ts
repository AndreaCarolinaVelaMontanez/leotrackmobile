import client from './client';
import { UserBook, UserBookDetail } from '../types';

export async function getLibrary(status?: string): Promise<UserBook[]> {
  const params: any = {};
  if (status) params.status = status;
  const { data } = await client.get('/library', { params });
  return data;
}

export async function addToLibrary(bookId: string, status?: string): Promise<UserBook> {
  const { data } = await client.post('/library', { bookId, status });
  return data;
}

export async function getBookDetail(userBookId: string): Promise<UserBookDetail> {
  const { data } = await client.get(`/library/${userBookId}`);
  return data;
}

export async function updateUserBook(
  userBookId: string,
  input: { status?: string; currentPage?: number }
): Promise<UserBook> {
  const { data } = await client.patch(`/library/${userBookId}`, input);
  return data;
}

export async function deleteUserBook(userBookId: string): Promise<void> {
  await client.delete(`/library/${userBookId}`);
}
