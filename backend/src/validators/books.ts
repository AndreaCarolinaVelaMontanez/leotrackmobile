import { z } from 'zod';

export const searchBooksSchema = z.object({
  q: z.string().min(1, 'Search query is required').max(200, 'Search query is too long'),
});

export const manualBookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(300),
  author: z.string().min(1, 'Author is required').max(200),
  category: z.string().max(100).optional(),
  pageCount: z.number().int().positive('Page count must be positive'),
  language: z.enum(['Spanish', 'English', 'Other']).optional(),
  status: z.enum(['READING', 'FINISHED', 'WISHLIST', 'ABANDONED']).optional().default('WISHLIST'),
});

export type ManualBookInput = z.infer<typeof manualBookSchema>;
