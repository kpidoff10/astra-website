/**
 * Email verification code helpers
 */

import { db } from '@/lib/db';
import { logger } from '@/lib/utils/logger';

/**
 * Generate a random 6-digit code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Create verification code for user
 */
export async function createVerificationCode(
  userId: string,
  email: string,
  expiresInMinutes: number = 15
) {
  try {
    // Delete old codes for this email
    await db.emailVerificationCode.deleteMany({
      where: { email },
    });

    // Create new code
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    const verification = await db.emailVerificationCode.create({
      data: {
        userId,
        email,
        code,
        expiresAt,
      },
    });

    logger.info(
      { userId, email, code, expiresAt },
      '[VerificationCode] ✅ Code created'
    );

    return { code, expiresAt };
  } catch (err) {
    logger.error(
      { userId, email, error: err },
      '[VerificationCode] ❌ Failed to create code'
    );
    throw err;
  }
}

/**
 * Verify code and mark email as verified
 */
export async function verifyCode(email: string, code: string) {
  try {
    const verification = await db.emailVerificationCode.findUnique({
      where: { code },
    });

    if (!verification) {
      logger.warn({ email, code }, '[VerificationCode] ❌ Code not found');
      return { success: false, error: 'Invalid code' };
    }

    if (verification.email !== email) {
      logger.warn(
        { email, providedEmail: verification.email },
        '[VerificationCode] ❌ Email mismatch'
      );
      return { success: false, error: 'Code does not match email' };
    }

    if (new Date() > verification.expiresAt) {
      logger.warn({ email, code }, '[VerificationCode] ❌ Code expired');
      return { success: false, error: 'Code expired' };
    }

    if (verification.attempts >= 5) {
      logger.warn({ email, code }, '[VerificationCode] ❌ Too many attempts');
      return { success: false, error: 'Too many failed attempts' };
    }

    // Mark as verified
    await db.emailVerificationCode.update({
      where: { code },
      data: {
        verifiedAt: new Date(),
      },
    });

    // Mark user email as verified
    await db.user.update({
      where: { id: verification.userId },
      data: { emailVerified: new Date() },
    });

    logger.info(
      { userId: verification.userId, email },
      '[VerificationCode] ✅ Email verified!'
    );

    return { success: true };
  } catch (err) {
    logger.error(
      { email, code, error: err },
      '[VerificationCode] ❌ Verification failed'
    );
    throw err;
  }
}

/**
 * Increment failed attempts
 */
export async function incrementVerificationAttempts(code: string) {
  try {
    await db.emailVerificationCode.update({
      where: { code },
      data: { attempts: { increment: 1 } },
    });
  } catch (err) {
    logger.error({ code, error: err }, '[VerificationCode] Failed to log attempt');
  }
}
