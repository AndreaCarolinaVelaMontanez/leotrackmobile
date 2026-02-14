import { z } from 'zod';

export const updateSettingsSchema = z.object({
  language: z.enum(['EN', 'ES']).optional(),
  theme: z.enum(['LIGHT', 'DARK']).optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
