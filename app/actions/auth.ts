'use server';

import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { logger } from '@/lib/utils/logger';
import { USER_ROLES, AUTH_ERRORS, VALIDATION } from '@/lib/constants';
import { Resend } from 'resend';
import { generateVerificationEmail } from '@/lib/emails/templates';
import { createVerificationCode } from '@/lib/emails/verification';

/**
 * Server Action for user registration
 * Handles: validation, user creation, email sending (async, fire-and-forget)
 */
export async function registerUser(formData: {
  email: string;
  password: string;
  name?: string;
  userType: 'human' | 'ai_agent';
}) {
  try {
    const { email, password, name, userType } = formData;

    // Validate inputs
    if (!email || !password || !userType) {
      return { error: 'Email, password, and userType are required' };
    }

    // Validate email format
    if (!VALIDATION.EMAIL_REGEX.test(email)) {
      return { error: AUTH_ERRORS.INVALID_EMAIL };
    }

    // Validate password strength
    if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
      return { error: AUTH_ERRORS.PASSWORD_TOO_SHORT };
    }

    if (!VALIDATION.PASSWORD_REGEX.test(password)) {
      return { error: AUTH_ERRORS.PASSWORD_WEAK };
    }

    // Check if email exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: AUTH_ERRORS.EMAIL_EXISTS };
    }

    // Determine role
    let role: 'USER' | 'AI_AGENT' | 'ADMIN' = USER_ROLES.USER;
    if (userType === 'ai_agent') {
      role = USER_ROLES.AI_AGENT;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    logger.info({ email }, '[SA] Creating user');
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        role,
      },
    });

    logger.info(
      { userId: user.id, email: user.email, role },
      '[SA] User registered successfully'
    );

    // ✅ AWAIT the verification code send (important!)
    logger.info({ email: user.email }, '[SA] ⏳ Sending verification code...');
    await sendVerificationCodeEmail(user.id, user.email, user.name || undefined);
    logger.info({ email: user.email }, '[SA] ✅ Verification code sent');

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  } catch (error) {
    logger.error({ error }, '[SA] Registration failed');
    return {
      error: error instanceof Error ? error.message : 'Registration failed',
    };
  }
}

/**
 * Send verification code email
 * - Creates a 6-digit code
 * - Logs attempt to EmailAudit table
 * - Sends via Resend
 * - Updates audit with result
 */
async function sendVerificationCodeEmail(
  userId: string,
  userEmail: string,
  userName?: string
): Promise<void> {
  try {
    // 1. Create verification code
    logger.info({ email: userEmail }, '[VerificationEmail] ⏳ Creating code...');
    const { code, expiresAt } = await createVerificationCode(userId, userEmail, 15);
    logger.info(
      { email: userEmail, code, expiresAt },
      '[VerificationEmail] ✅ Code created'
    );

    // 2. Create audit record
    const audit = await db.emailAudit.create({
      data: {
        userId,
        email: userEmail,
        template: 'verification',
        status: 'PENDING',
      },
    });

    // 3. Send via Resend
    const apiKey = process.env.RESEND_API_KEY || '';
    if (!apiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const resend = new Resend(apiKey);
    const html = generateVerificationEmail(userEmail, code, userName, 15);

    logger.info({ email: userEmail }, '[VerificationEmail] ⏳ Sending via Resend...');

    const { data, error } = await resend.emails.send({
      from: 'Astra <astra@astra-ia.dev>',
      to: userEmail,
      subject: 'Vérifier votre email Astra 🔐',
      html: html,
    } as Record<string, unknown>);

    // 4. Handle result
    if (error) {
      await db.emailAudit.update({
        where: { id: audit.id },
        data: {
          status: 'FAILED',
          error: error.message,
        },
      });

      logger.error(
        { userId, email: userEmail, error: error.message },
        '[VerificationEmail] ❌ Failed to send'
      );

      await notifyAdminEmailFailure(userId, userEmail, error.message);
    } else if (data?.id) {
      await db.emailAudit.update({
        where: { id: audit.id },
        data: {
          status: 'SENT',
          resendId: data.id,
          sentAt: new Date(),
        },
      });

      logger.info(
        { userId, email: userEmail, resendId: data.id },
        '[VerificationEmail] ✅ Verification email sent successfully'
      );
    } else {
      await db.emailAudit.update({
        where: { id: audit.id },
        data: {
          status: 'FAILED',
          error: 'Unknown: No email ID returned',
        },
      });

      logger.warn(
        { userId, email: userEmail },
        '[VerificationEmail] ⚠️ No response from Resend'
      );
    }
  } catch (err) {
    logger.error(
      { userId, email: userEmail, error: err },
      '[VerificationEmail] ❌ Exception'
    );

    // Try to mark audit as FAILED
    try {
      const audit = await db.emailAudit.findFirst({
        where: {
          userId,
          email: userEmail,
          template: 'verification',
          status: 'PENDING',
        },
        orderBy: { createdAt: 'desc' },
      });

      if (audit) {
        await db.emailAudit.update({
          where: { id: audit.id },
          data: {
            status: 'FAILED',
            error: err instanceof Error ? err.message : 'Unknown error',
          },
        });
      }
    } catch (updateErr) {
      logger.error({ error: updateErr }, '[VerificationEmail] Audit update failed');
    }
  }
}

/**
 * Notify admin of email failures
 * TODO: Send to Slack/Discord when failures exceed threshold
 * For now: just logs
 */
async function notifyAdminEmailFailure(
  userId: string,
  email: string,
  errorMessage: string
): Promise<void> {
  logger.warn(
    { userId, email, error: errorMessage },
    '[EmailSend] 🚨 Email failure alert (implement Slack/Discord notification here)'
  );

  // TODO: When implemented:
  // await sendSlackAlert({
  //   text: `:email_failure: Email send failed for ${email}`,
  //   details: errorMessage,
  // });
}
