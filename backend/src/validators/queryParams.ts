import { z } from 'zod';

const isoDateRegex = /^\d{4}-\d{2}-\d{2}/;

export const libraryQuerySchema = z.object({
  status: z.enum(['READING', 'FINISHED', 'WISHLIST', 'ABANDONED']).optional(),
});

export const statsQuerySchema = z.object({
  period: z.enum(['week', 'month', 'year']).default('week'),
  ref: z.string().regex(isoDateRegex, 'Invalid date format').optional(),
});

export const dateRangeQuerySchema = z.object({
  from: z.string().regex(isoDateRegex, 'Invalid date format').optional(),
  to: z.string().regex(isoDateRegex, 'Invalid date format').optional(),
});
