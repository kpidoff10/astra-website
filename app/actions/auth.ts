'use server';

import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/services/email';
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

    // Send email in background (don't block response)
    console.log('[SA] Queueing email send for:', email);
    sendWelcomeEmail(user.email, user.name || undefined)
      .then((id) => {
        console.log('[SA] Email sent! ID:', id);
      })
      .catch((err) => {
        console.error('[SA] Email failed:', err);
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
