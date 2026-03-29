import { NextRequest, NextResponse } from 'next/server';
import { verifyCode, incrementVerificationAttempts } from '@/lib/emails/verification';
import { logger } from '@/lib/utils/logger';

/**
 * POST /api/auth/verify-email
 * Verify email with code
 */
export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      );
    }

    logger.info({ email, code }, '[VerifyEmail] Attempting verification');

    const result = await verifyCode(email, code);

    if (!result.success) {
      // Log failed attempt
      await incrementVerificationAttempts(code).catch(() => {});
      
      logger.warn(
        { email, code, error: result.error },
        '[VerifyEmail] ❌ Verification failed'
      );
      
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    logger.info(
      { email },
      '[VerifyEmail] ✅ Email verified successfully'
    );

    return NextResponse.json({
      success: true,
      message: 'Email verified! You can now log in.',
    });
  } catch (error) {
    logger.error({ error }, '[VerifyEmail] Exception');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Verification failed' },
      { status: 500 }
    );
  }
}
