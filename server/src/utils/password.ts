import bcrypt from 'bcrypt';
import zxcvbn from 'zxcvbn';

const SALT_ROUNDS = 10;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function isPasswordStrong(password: string): boolean {
  const result = zxcvbn(password);
  // Require at least score 3 (0-4)
  return result.score >= 3;
}
