interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const store: RateLimitStore = {};

export interface RateLimitOptions {
  windowMs?: number; // Time window in milliseconds (default: 15 minutes)
  maxRequests?: number; // Max requests per window (default: 5)
  message?: string;
}

export interface RateLimitCheckResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
  message?: string;
}

/**
 * Check if request should be rate limited (core logic, testable without Next.js)
 */
export function checkRateLimit(
  ip: string,
  options: RateLimitOptions = {}
): RateLimitCheckResult {
  const {
    windowMs = 15 * 60 * 1000,
    maxRequests = 5,
    message = 'Too many requests, please try again later',
  } = options;

  const now = Date.now();

  // Initialize or get existing record
  if (!store[ip]) {
    store[ip] = { count: 0, resetTime: now + windowMs };
  }

  const record = store[ip];

  // Reset if window expired
  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + windowMs;
  }

  // Increment counter
  record.count++;

  const retryAfter = Math.ceil((record.resetTime - now) / 1000);
  const remaining = Math.max(0, maxRequests - record.count);

  // Check if limit exceeded
  if (record.count > maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter,
      message,
    };
  }

  return {
    allowed: true,
    remaining,
    retryAfter: 0,
  };
}

/**
 * Create a rate limiter middleware for Next.js
 */
export function createRateLimiter(options: RateLimitOptions = {}) {
  return async (request: any) => {
    const ip = request.ip || request.headers?.get?.('x-forwarded-for') || 'unknown';
    const result = checkRateLimit(ip, options);

    if (!result.allowed) {
      // Import here to avoid Next.js context in tests
      const { NextResponse } = await import('next/server');
      return new NextResponse(
        JSON.stringify({
          error: result.message,
          retryAfter: result.retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': result.retryAfter.toString(),
          },
        }
      );
    }

    return null; // Continue to next handler
  };
}

/**
 * Rate limit specifically for auth endpoints
 * Stricter limits for registration/login
 */
export function createAuthRateLimiter() {
  return createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // Max 5 attempts per 15 minutes
    message: 'Trop de tentatives. Veuillez réessayer plus tard.',
  });
}

/**
 * Rate limit for password reset
 */
export function createPasswordResetRateLimiter() {
  return createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // Max 3 reset attempts per hour
    message: 'Trop de demandes de réinitialisation. Réessayez dans 1 heure.',
  });
}

/**
 * Clear rate limit for testing purposes
 */
export function clearRateLimitStore() {
  Object.keys(store).forEach((key) => delete store[key]);
}

/**
 * Get rate limit info for testing
 */
export function getRateLimitInfo(ip: string) {
  return store[ip] || null;
}
