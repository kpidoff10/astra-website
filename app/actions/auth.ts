'use server';

import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { logger } from '@/lib/utils/logger';
import { USER_ROLES, AUTH_ERRORS, VALIDATION } from '@/lib/constants';

/**
 * Server Action for user registration
 * Handles: validation, user creation, email sending
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
    console.log('[SA] Creating user:', email);
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
      'User registered via Server Action'
    );

    // Send email via Server Action (no external call needed)
    console.log('[SA] Queueing welcome email');
    sendWelcomeEmailAction(user.email, user.name || undefined).catch((err) => {
      console.error('[SA] Welcome email failed:', err);
    });

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
    console.error('[SA] Registration error:', error);
    return {
      error: error instanceof Error ? error.message : 'Registration failed',
    };
  }
}

/**
 * Protected Server Action to send welcome email
 * Runs on the server, no external API call
 */
async function sendWelcomeEmailAction(email: string, name?: string): Promise<string | null> {
  try {
    console.log('[EmailAction] Sending welcome email to:', email);

    // Import email template
    const { generateWelcomeEmail } = await import('@/lib/emails/templates');
    const html = generateWelcomeEmail(email, name);

    // Import Resend
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    console.log('[EmailAction] Calling Resend API');
    const { data, error } = await resend.emails.send({
      from: 'Astra <astra@astra-ia.dev>',
      to: email,
      subject: 'Bienvenue sur Astra ✨',
      html: html,
    });

    if (error) {
      console.error('[EmailAction] Resend error:', error);
      return null;
    }

    if (data?.id) {
      console.log('[EmailAction] ✅ SUCCESS! Email ID:', data.id);
      return data.id;
    }

    console.log('[EmailAction] ❌ No ID in response');
    return null;
  } catch (err) {
    console.error('[EmailAction] Exception:', err);
    return null;
  }
}
