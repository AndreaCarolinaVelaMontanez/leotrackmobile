import { z } from 'zod';

export const createProgressSchema = z.object({
  userBookId: z.string().uuid('Invalid user book ID'),
  pagesRead: z.number().int().positive('Pages read must be positive'),
});

export type CreateProgressInput = z.infer<typeof createProgressSchema>;
