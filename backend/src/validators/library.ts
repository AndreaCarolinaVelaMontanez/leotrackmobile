import { z } from 'zod';

export const addToLibrarySchema = z.object({
  bookId: z.string().uuid('Invalid book ID'),
  status: z.enum(['READING', 'FINISHED', 'WISHLIST', 'ABANDONED']).optional().default('WISHLIST'),
});

export const updateUserBookSchema = z.object({
  status: z.enum(['READING', 'FINISHED', 'WISHLIST', 'ABANDONED']).optional(),
  currentPage: z.number().int().min(0).optional(),
});

export type AddToLibraryInput = z.infer<typeof addToLibrarySchema>;
export type UpdateUserBookInput = z.infer<typeof updateUserBookSchema>;
