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

    // Send email via internal API route (awaited properly)
    console.log('[SA] Sending welcome email via API route');
    try {
      const emailResult = await sendWelcomeEmailViaAPI(user.email, user.name || undefined);
      if (!emailResult.success) {
        console.warn('[SA] Welcome email failed:', emailResult.error);
      }
    } catch (emailErr) {
      console.error('[SA] Welcome email exception:', emailErr);
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

/**
 * Helper: Call the internal API route to send email
 * This is SYNCHRONOUS and reliable on Vercel
 */
async function sendWelcomeEmailViaAPI(email: string, name?: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[EmailViaAPI] Calling /api/emails/send for:', email);
    
    // Build absolute URL for API call (required in Server Actions)
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/emails/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        name: name || undefined,
        type: 'welcome',
      }),
    });

    if (!response.ok) {
      console.error('[EmailViaAPI] HTTP error:', response.status);
      const errData = await response.text();
      return { 
        success: false, 
        error: `HTTP ${response.status}: ${errData}` 
      };
    }

    const data = await response.json();
    
    if (data?.success) {
      console.log('[EmailViaAPI] ✅ Email sent! ID:', data.emailId);
      return { success: true };
    }

    console.error('[EmailViaAPI] ❌ API returned error:', data?.error);
    return { 
      success: false, 
      error: data?.error || 'Unknown API error' 
    };
  } catch (err) {
    console.error('[EmailViaAPI] Exception:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
}
