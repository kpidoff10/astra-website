import crypto from 'crypto';

// OWASP 2024 recommendation: minimum 600,000 iterations
// Using 600,000 for strong security against rainbow tables & GPU attacks
const PBKDF2_ITERATIONS = 600000;
const PBKDF2_DIGEST = 'sha512';
const PBKDF2_KEYLEN = 64;

/**
 * Hash a password using PBKDF2 with 600k iterations (OWASP 2024 recommendation)
 * @param password Password to hash
 * @returns Salted password hash: salt:hash
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST)
    .toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify a password against its hash
 * @param password Plain password to verify
 * @param hashedPassword Salted hash from hashPassword()
 * @returns true if password matches
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  const [salt, hash] = hashedPassword.split(':');
  if (!salt || !hash) return false;

  try {
    const computedHash = crypto
      .pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST)
      .toString('hex');

    // Ensure lengths match before timing-safe comparison
    if (computedHash.length !== hash.length) return false;

    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(hash));
  } catch (error) {
    // Any error during verification = invalid hash
    return false;
  }
}

/**
 * Generate a random token (for email verification, password reset, etc.)
 * @param length Number of random bytes (default: 32 = 256 bits)
 * @returns Hex-encoded random token
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}
