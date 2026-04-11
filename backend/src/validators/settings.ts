import { z } from 'zod';

export const updateSettingsSchema = z.object({
  language: z.enum(['EN', 'ES']).optional(),
  theme: z.enum(['LIGHT', 'DARK']).optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  country: z.string().max(100).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
