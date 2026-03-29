'use server';

import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { logger } from '@/lib/utils/logger';
import { USER_ROLES, AUTH_ERRORS, VALIDATION } from '@/lib/constants';
import { Resend } from 'resend';
import { generateWelcomeEmail } from '@/lib/emails/templates';

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

    // Send email DIRECTLY via Resend (no API route needed)
    console.log('[SA] 🔵 SENDING EMAIL DIRECTLY VIA RESEND for:', user.email);
    try {
      console.log('[SA] ⏳ Creating Resend instance...');
      const apiKey = process.env.RESEND_API_KEY || '';
      const resend = new Resend(apiKey);
      
      console.log('[SA] ⏳ Generating email HTML...');
      const html = generateWelcomeEmail(user.email, user.name);
      
      console.log('[SA] ⏳ Calling resend.emails.send()...');
      const { data, error } = await resend.emails.send({
        from: 'Astra <astra@astra-ia.dev>' as string,
        to: user.email as string,
        subject: 'Bienvenue sur Astra ✨',
        html: html,
      });
      
      if (error) {
        console.error('[SA] ❌ RESEND ERROR:', error.message);
      } else {
        console.log('[SA] ✅✅✅ EMAIL SENT! ID:', data?.id);
      }
    } catch (emailErr) {
      console.error('[SA] ❌ EMAIL EXCEPTION:', emailErr instanceof Error ? emailErr.message : String(emailErr));
    }

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
