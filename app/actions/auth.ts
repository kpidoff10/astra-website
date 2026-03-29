'use server';

import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { logger } from '@/lib/utils/logger';
import { USER_ROLES, AUTH_ERRORS, VALIDATION } from '@/lib/constants';
import { Resend } from 'resend';
import { generateWelcomeEmail } from '@/lib/emails/templates';

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

    // ✅ AWAIT the email send (important!)
    // Even though it's "fire-and-forget", we MUST await for the Server Action to finish
    // Otherwise Vercel cuts off the execution before email sends
    logger.info({ email: user.email }, '[SA] ⏳ Awaiting email send...');
    await sendWelcomeEmailAsync(user.id, user.email, user.name || undefined);
    logger.info({ email: user.email }, '[SA] ✅ Email send completed (or failed)');

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
 * Fire-and-forget email send function
 * - Logs attempt to EmailAudit table
 * - Sends via Resend
 * - Updates audit with result
 * - Does NOT throw (handled by .catch() in registerUser)
 */
async function sendWelcomeEmailAsync(
  userId: string,
  userEmail: string,
  userName?: string
): Promise<void> {
  try {
    // 1. Create audit record (shows we attempted)
    const audit = await db.emailAudit.create({
      data: {
        userId,
        email: userEmail,
        template: 'welcome',
        status: 'PENDING',
      },
    });

    logger.info(
      { auditId: audit.id, email: userEmail },
      '[EmailSend] 📋 Audit record created'
    );

    // 2. Send via Resend
    const apiKey = process.env.RESEND_API_KEY || '';
    if (!apiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const resend = new Resend(apiKey);
    const html = generateWelcomeEmail(userEmail, userName);

    logger.info({ email: userEmail }, '[EmailSend] ⏳ Calling Resend API...');

    const { data, error } = await resend.emails.send({
      from: 'Astra <astra@astra-ia.dev>',
      to: userEmail,
      subject: 'Bienvenue sur Astra ✨',
      html: html,
    } as any);

    // 3. Handle result
    if (error) {
      // Email send failed
      await db.emailAudit.update({
        where: { id: audit.id },
        data: {
          status: 'FAILED',
          error: error.message,
        },
      });

      logger.error(
        { userId, email: userEmail, error: error.message },
        '[EmailSend] ❌ Resend email send failed'
      );

      // Alert admin (stub for future Slack/Discord)
      await notifyAdminEmailFailure(userId, userEmail, error.message);
    } else if (data?.id) {
      // Email sent successfully
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
        '[EmailSend] ✅ Welcome email sent successfully'
      );
    } else {
      // Unexpected: no error, but no data.id
      await db.emailAudit.update({
        where: { id: audit.id },
        data: {
          status: 'FAILED',
          error: 'Unknown: No email ID returned',
        },
      });

      logger.warn(
        { userId, email: userEmail },
        '[EmailSend] ⚠️ Email send returned empty response'
      );
    }
  } catch (err) {
    logger.error(
      { userId, email: userEmail, error: err },
      '[EmailSend] ❌ Unexpected error in email send'
    );

    // Try to mark audit as FAILED (best effort)
    try {
      const audit = await db.emailAudit.findFirst({
        where: {
          userId,
          email: userEmail,
          template: 'welcome',
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
      logger.error(
        { error: updateErr },
        '[EmailSend] Failed to update audit record (double failure)'
      );
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
