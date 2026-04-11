import crypto from 'crypto';

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function generateResetCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}
