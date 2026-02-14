import { z } from 'zod';

export const createSessionSchema = z.object({
  userBookId: z.string().uuid('Invalid user book ID'),
  startedAt: z.string().datetime('Invalid start date'),
  endedAt: z.string().datetime('Invalid end date'),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
