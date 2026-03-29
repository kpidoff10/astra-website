import jwt from 'jsonwebtoken';

const JWT_EXPIRES_IN = '30d';

// Lazy-load JWT_SECRET to allow tests to set it
function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return secret;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Sign a JWT token
 * @param payload User data to encode
 * @returns Signed JWT token
 */
export function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  try {
    const token = jwt.sign(payload, getJWTSecret(), {
      expiresIn: JWT_EXPIRES_IN,
      algorithm: 'HS256',
    });
    return token;
  } catch (error) {
    throw new Error(`Failed to sign token: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Verify and decode a JWT token
 * @param token JWT token to verify
 * @returns Decoded payload or null if invalid
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const payload = jwt.verify(token, getJWTSecret(), {
      algorithms: ['HS256'],
    }) as JWTPayload;
    return payload;
  } catch {
    // Token is invalid or expired
    return null;
  }
}

/**
 * Decode token without verification (for debugging)
 * WARNING: Only use this if you understand the security implications
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const payload = jwt.decode(token) as JWTPayload | null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Refresh a token (for session extension)
 */
export function refreshToken(token: string): string | null {
  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  // Remove iat and exp from payload before re-signing
  const { ...data } = payload;
  return signToken(data);
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) {
    return true;
  }

  return payload.exp * 1000 < Date.now();
}

/**
 * Get remaining time until token expires (in seconds)
 */
export function getTokenExpiresIn(token: string): number {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) {
    return 0;
  }

  const expiresIn = payload.exp - Math.floor(Date.now() / 1000);
  return Math.max(0, expiresIn);
}
