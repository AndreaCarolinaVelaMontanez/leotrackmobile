import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { UpdateSettingsInput } from '../validators/settings';

export async function getSettings(userId: string) {
  const settings = await prisma.userSettings.findUnique({
    where: { userId },
  });

  if (!settings) {
    throw new AppError(404, 'Settings not found');
  }

  return settings;
}

export async function updateSettings(userId: string, input: UpdateSettingsInput) {
  const settings = await prisma.userSettings.update({
    where: { userId },
    data: input,
  });

  return settings;
}
