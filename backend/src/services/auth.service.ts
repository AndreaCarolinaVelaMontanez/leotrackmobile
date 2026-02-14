import { prisma } from '../utils/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/token';
import { AppError } from '../middleware/errorHandler';
import { RegisterInput, LoginInput } from '../validators/auth';

const SESSION_EXPIRY_DAYS = 30;

function getSessionExpiry(): Date {
  const date = new Date();
  date.setDate(date.getDate() + SESSION_EXPIRY_DAYS);
  return date;
}

export async function register(input: RegisterInput) {
  const email = input.email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError(409, 'Could not create account');
  }

  const hashedPassword = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email,
      password: hashedPassword,
      settings: {
        create: {
          language: 'EN',
          theme: 'LIGHT',
        },
      },
    },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  const token = generateToken();
  await prisma.authSession.create({
    data: {
      token,
      userId: user.id,
      expiresAt: getSessionExpiry(),
    },
  });

  return { user, token };
}

export async function login(input: LoginInput) {
  const email = input.email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, createdAt: true, password: true },
  });

  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }

  const valid = await comparePassword(input.password, user.password);
  if (!valid) {
    throw new AppError(401, 'Invalid email or password');
  }

  const token = generateToken();
  await prisma.authSession.create({
    data: {
      token,
      userId: user.id,
      expiresAt: getSessionExpiry(),
    },
  });

  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
}

export async function logout(token: string) {
  await prisma.authSession.deleteMany({ where: { token } });
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return user;
}
