import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as libraryApi from '../api/library';

export function useLibraryList(status?: string) {
  return useQuery({
    queryKey: ['library', status],
    queryFn: () => libraryApi.getLibrary(status),
  });
}

export function useAddToLibrary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookId, status }: { bookId: string; status?: string }) =>
      libraryApi.addToLibrary(bookId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
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
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
