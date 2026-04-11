import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { UpdateSettingsInput, UpdateProfileInput } from '../validators/settings';

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

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { name: input.name, country: input.country },
    select: { id: true, name: true, email: true, country: true, createdAt: true },
  });

  return user;
}
