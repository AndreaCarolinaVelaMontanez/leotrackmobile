import { z } from 'zod';

const MIN_SESSION_DATE = new Date('2020-01-01T00:00:00.000Z');

export const createSessionSchema = z.object({
  userBookId: z.string().uuid('Invalid user book ID'),
  startedAt: z.string().datetime('Invalid start date').refine(
    (val) => new Date(val) >= MIN_SESSION_DATE,
    { message: 'Session date cannot be before 2020' }
  ),
  endedAt: z.string().datetime('Invalid end date').refine(
    (val) => new Date(val) >= MIN_SESSION_DATE,
    { message: 'Session date cannot be before 2020' }
  ),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
