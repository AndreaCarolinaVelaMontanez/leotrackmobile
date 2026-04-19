import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as libraryApi from '../api/library';

export function useLibraryList(status?: string, year?: number, page = 1, limit = 10) {
  return useQuery({
    queryKey: ['library', status, year, page, limit],
    queryFn: () => libraryApi.getLibrary(status, year, page, limit),
    placeholderData: (prev) => prev,
  });
}

export function useLibraryYears() {
  return useQuery({
    queryKey: ['library-years'],
    queryFn: () => libraryApi.getLibraryYears(),
    staleTime: 60000,
  });
}

export function useAddToLibrary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookId, status, finishedYear, pageCount }: { bookId: string; status?: string; finishedYear?: number; pageCount?: number }) =>
      libraryApi.addToLibrary(bookId, status, finishedYear, pageCount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
      queryClient.invalidateQueries({ queryKey: ['library-years'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useBookDetail(userBookId: string) {
  return useQuery({
    queryKey: ['library', userBookId],
    queryFn: () => libraryApi.getBookDetail(userBookId),
    enabled: !!userBookId,
  });
}

export function useUpdateUserBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userBookId,
      input,
    }: {
      userBookId: string;
      input: { status?: string; currentPage?: number };
    }) => libraryApi.updateUserBook(userBookId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useDeleteUserBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userBookId: string) => libraryApi.deleteUserBook(userBookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
      queryClient.invalidateQueries({ queryKey: ['library-years'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
