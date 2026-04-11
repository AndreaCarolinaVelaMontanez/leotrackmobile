import { z } from 'zod';

export const createProgressSchema = z.object({
  userBookId: z.string().uuid('Invalid user book ID'),
  pagesRead: z.number().int().min(1, 'Pages read must be at least 1').max(5000, 'Cannot log more than 5000 pages at once'),
});

export type CreateProgressInput = z.infer<typeof createProgressSchema>;
