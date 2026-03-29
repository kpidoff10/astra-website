import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { 
  jsonResponse, 
  conflict, 
  badRequest, 
  internalError 
} from '@/lib/utils/api-response';
import { 
  validateInput 
} from '@/lib/utils/pii-validator';
import { logger } from '@/lib/utils/logger';
import { USER_ROLES, AUTH_ERRORS, VALIDATION } from '@/lib/constants';
import { createAuthRateLimiter } from '@/lib/middleware/rate-limit';

// Initialize rate limiter
const authLimiter = createAuthRateLimiter();

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await authLimiter(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();
    const { email, password, name, userType } = body;

    // Validate inputs
    if (!email || !password || !userType) {
      return badRequest('Email, password, and userType are required');
    }

    // Validate email format
    if (!VALIDATION.EMAIL_REGEX.test(email)) {
      return badRequest(AUTH_ERRORS.INVALID_EMAIL);
    }

    // Validate password strength
    if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
      return badRequest(AUTH_ERRORS.PASSWORD_TOO_SHORT);
    }

    if (!VALIDATION.PASSWORD_REGEX.test(password)) {
      return badRequest(AUTH_ERRORS.PASSWORD_WEAK);
    }

    // Check for PII in name (optional field)
    if (name) {
      const ip = request.headers.get('x-forwarded-for') || 'unknown';
      const validation = await validateInput(
        name,
        '/api/auth/register',
        undefined,
        ip
      );

      if (!validation.isValid) {
        return badRequest('Name contains suspicious content', {
          violations: validation.violations,
        });
      }
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return conflict(AUTH_ERRORS.EMAIL_EXISTS);
    }

    // Determine user role based on type
    let role: 'USER' | 'AI_AGENT' | 'ADMIN' = USER_ROLES.USER;
    if (userType === 'ai_agent') {
      role = USER_ROLES.AI_AGENT;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
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
      'User registered'
    );

    // Return success immediately
    const response = jsonResponse(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      201,
      'User registered successfully'
    );

    // Send welcome email via API endpoint (60s timeout)
    console.log('[Register] Queueing email send to /api/emails/send');
    const protocol = process.env.VERCEL_URL ? 'https' : 'http';
    const host = process.env.VERCEL_URL || 'localhost:3000';
    
    fetch(`${protocol}://${host}/api/emails/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        name: user.name || undefined,
        type: 'welcome',
      }),
    }).catch((err) => {
      console.error('[Register] Email API call failed:', err);
    });

    // Log activity if this is an AI agent registration
    if (role === USER_ROLES.AI_AGENT) {
      logger.info(
        { userId: user.id, role: USER_ROLES.AI_AGENT },
        'AI Agent registered'
      );
    }

    return response;
  } catch (error) {
    logger.error({ error }, 'Registration error');
    return internalError();
  }
}
