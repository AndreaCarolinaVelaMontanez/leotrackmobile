import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../utils/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken, generateResetCode } from '../utils/token';
import { AppError } from '../middleware/errorHandler';
import { RegisterInput, LoginInput, VerifyEmailInput } from '../validators/auth';
import { sendPasswordResetEmail, sendVerificationEmail } from './email.service';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const RESET_TOKEN_EXPIRY_MS = 10 * 60 * 1000; // 10 minutos (el usuario debe usar el token dentro de este tiempo)
const VERIFICATION_CODE_EXPIRY_MS = 15 * 60 * 1000; // 15 minutos

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
    throw new AppError(409, 'Please verify your details or try signing in');
  }

  const hashedPassword = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email,
      password: hashedPassword,
      country: input.country,
      emailVerified: false,
      settings: {
        create: {
          language: 'EN',
          theme: 'LIGHT',
        },
      },
    },
    select: { id: true, name: true, email: true },
  });

  // Generate 6-digit verification code
  const code = generateResetCode();
  await prisma.emailVerificationToken.create({
    data: {
      token: code,
      userId: user.id,
      expiresAt: new Date(Date.now() + VERIFICATION_CODE_EXPIRY_MS),
    },
  });

  await sendVerificationEmail(user.email, user.name, code);

  return { userId: user.id, email: user.email };
}

export async function verifyEmail(input: VerifyEmailInput) {
  const record = await prisma.emailVerificationToken.findFirst({
    where: {
      userId: input.userId,
      token: input.code,
      used: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!record) {
    throw new AppError(400, 'Invalid or expired code');
  }

  const user = await prisma.$transaction(async (tx) => {
    await tx.emailVerificationToken.update({
      where: { id: record.id },
      data: { used: true },
    });
    return tx.user.update({
      where: { id: input.userId },
      data: { emailVerified: true },
      select: { id: true, name: true, email: true, country: true, createdAt: true },
    });
  });

  const token = generateToken();
  await prisma.authSession.create({
    data: { token, userId: user.id, expiresAt: getSessionExpiry() },
  });

  return { user, token };
}

export async function resendVerification(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, emailVerified: true },
  });

  if (!user) throw new AppError(404, 'User not found');
  if (user.emailVerified) throw new AppError(400, 'Email already verified');

  // DB-3: delete previous codes instead of just marking used
  await prisma.emailVerificationToken.deleteMany({
    where: { userId, used: false },
  });

  const code = generateResetCode();
  await prisma.emailVerificationToken.create({
    data: {
      token: code,
      userId: user.id,
      expiresAt: new Date(Date.now() + VERIFICATION_CODE_EXPIRY_MS),
    },
  });

  await sendVerificationEmail(user.email, user.name, code);
}

export async function login(input: LoginInput) {
  const email = input.email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, country: true, createdAt: true, password: true, emailVerified: true },
  });

  if (!user || !user.password) {
    throw new AppError(401, 'Invalid email or password');
  }

  const valid = await comparePassword(input.password, user.password);
  if (!valid) {
    throw new AppError(401, 'Invalid email or password');
  }

  if (!user.emailVerified) {
    throw new AppError(403, 'Please verify your email before signing in');
  }

  const token = generateToken();
  await prisma.authSession.create({
    data: {
      token,
      userId: user.id,
      expiresAt: getSessionExpiry(),
    },
  });

  // DB-2: clean up expired sessions for this user in background
  prisma.authSession.deleteMany({
    where: { userId: user.id, expiresAt: { lt: new Date() } },
  }).catch(() => {});

  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
}

export async function logout(userId: string) {
  await prisma.authSession.deleteMany({ where: { userId } });
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, country: true, createdAt: true },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return user;
}

export async function forgotPassword(email: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true },
  });

  // S-PR-04: Si el email no existe, salimos silenciosamente sin error
  // El controller siempre responde igual, nunca revelamos si el email existe
  if (!user) return;

  // DB-4: delete previous unused reset tokens before creating a new one
  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id, used: false },
  });

  const token = generateResetCode();

  // S-PR-02: Expira en exactamente 10 minutos
  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt },
  });

  await sendPasswordResetEmail(user.email, user.name, token);
}

export async function googleLogin(idToken: string, country?: string) {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new AppError(401, 'Invalid Google token');
  }

  const { email, name, sub: googleId } = payload;

  let user = await prisma.user.findFirst({
    where: { OR: [{ googleId }, { email }] },
    select: { id: true, name: true, email: true, country: true, createdAt: true, googleId: true },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: name ?? email.split('@')[0],
        email,
        googleId,
        country,
        emailVerified: true,
        settings: { create: { language: 'EN', theme: 'LIGHT' } },
      },
      select: { id: true, name: true, email: true, country: true, createdAt: true, googleId: true },
    });
  } else if (!user.googleId) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { googleId },
      select: { id: true, name: true, email: true, country: true, createdAt: true, googleId: true },
    });
  }

  const token = generateToken();
  await prisma.authSession.create({
    data: { token, userId: user.id, expiresAt: getSessionExpiry() },
  });

  const { googleId: _, ...userWithoutGoogleId } = user;
  return { user: userWithoutGoogleId, token };
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  // S-PR-02 + S-PR-03: Mensaje unificado — nunca revelar la razón exacta del fallo
  if (!resetToken || resetToken.expiresAt < new Date() || resetToken.used) {
    throw new AppError(400, 'Invalid or expired reset token');
  }

  // S-PR-06: Hashear nueva contraseña con bcryptjs (10 salt rounds via hashPassword)
  const hashedPassword = await hashPassword(newPassword);

  // Transacción atómica: los 3 cambios ocurren juntos o ninguno ocurre
  await prisma.$transaction([
    // 1. Actualizar la contraseña del usuario
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    }),
    // 2. Marcar el token como usado (S-PR-03: no puede reutilizarse)
    prisma.passwordResetToken.update({
      where: { token },
      data: { used: true },
    }),
    // 3. Invalidar todas las sesiones activas (S-PR-07)
    prisma.authSession.deleteMany({
      where: { userId: resetToken.userId },
    }),
  ]);
}
