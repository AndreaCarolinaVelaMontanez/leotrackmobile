import { useQuery } from '@tanstack/react-query';
import * as booksApi from '../api/books';

export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => booksApi.searchBooks(query),
    enabled: query.length >= 2,
  });
}
