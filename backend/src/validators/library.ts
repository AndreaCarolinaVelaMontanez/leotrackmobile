import { z } from 'zod';

export const addToLibrarySchema = z.object({
  bookId: z.string().uuid('Invalid book ID'),
  status: z.enum(['READING', 'FINISHED', 'WISHLIST', 'ABANDONED']).optional().default('WISHLIST'),
  finishedYear: z.number().int().min(1900).refine(
    (val) => val <= new Date().getFullYear(),
    { message: 'Finished year cannot be in the future' }
  ).optional(),
  pageCount: z.number().int().min(1).optional(),
});

export const updateUserBookSchema = z.object({
  status: z.enum(['READING', 'FINISHED', 'WISHLIST', 'ABANDONED']).optional(),
  currentPage: z.number().int().min(0).optional(),
  recommended: z.boolean().optional(),
});

export type AddToLibraryInput = z.infer<typeof addToLibrarySchema>;
export type UpdateUserBookInput = z.infer<typeof updateUserBookSchema>;
