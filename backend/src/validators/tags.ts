import { z } from 'zod';
import { VALID_TAGS } from '../constants/bookTags';

export const setTagsSchema = z.object({
  tags: z
    .array(z.enum(VALID_TAGS as unknown as [string, ...string[]]))
    .min(0)
    .max(2),
});

export type SetTagsInput = z.infer<typeof setTagsSchema>;
