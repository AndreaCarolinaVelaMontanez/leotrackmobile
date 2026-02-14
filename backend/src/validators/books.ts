import { z } from 'zod';

export const searchBooksSchema = z.object({
  q: z.string().min(1, 'Search query is required'),
});

export const manualBookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  category: z.string().optional(),
  pageCount: z.number().int().positive('Page count must be positive'),
  language: z.string().optional(),
  status: z.enum(['READING', 'FINISHED', 'WISHLIST', 'ABANDONED']).optional().default('WISHLIST'),
});

export type ManualBookInput = z.infer<typeof manualBookSchema>;
