import crypto from 'crypto';

/**
 * Hash a password using PBKDF2
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  const [salt, hash] = hashedPassword.split(':');
  if (!salt || !hash) return false;

  const computedHash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex');

  return computedHash === hash;
}

/**
 * Generate a random token (for email verification, etc.)
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Create a JWT-like token (simplified, for session tokens)
 * In production, use jsonwebtoken library
 */
export function createSessionToken(userId: string, role: string): string {
  const payload = {
    userId,
    role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
  };

  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

/**
 * Verify and decode a session token
 */
export function verifySessionToken(token: string): {
  userId: string;
  role: string;
  iat: number;
  exp: number;
} | null {
  try {
    const decoded = JSON.parse(
      Buffer.from(token, 'base64').toString('utf-8')
    );

    // Check expiration
    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}
