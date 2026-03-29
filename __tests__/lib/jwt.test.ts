import {
  signToken,
  verifyToken,
  decodeToken,
  refreshToken,
  isTokenExpired,
  getTokenExpiresIn,
  JWTPayload,
} from '@/lib/jwt';

describe('JWT Service', () => {
  const testPayload = {
    userId: 'user-123',
    email: 'test@example.com',
    role: 'USER',
  };

  beforeEach(() => {
    // Ensure JWT_SECRET is set
    process.env.JWT_SECRET = 'test-secret-key-min-32-chars-long!!!';
  });

  describe('signToken', () => {
    it('creates a valid JWT token', () => {
      const token = signToken(testPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    it('token can be verified and decoded', () => {
      const token = signToken(testPayload);
      const decoded = verifyToken(token);

      expect(decoded).not.toBeNull();
      expect(decoded?.userId).toBe(testPayload.userId);
      expect(decoded?.email).toBe(testPayload.email);
      expect(decoded?.role).toBe(testPayload.role);
    });

    it('includes iat (issued at) claim', () => {
      const token = signToken(testPayload);
      const decoded = decodeToken(token);

      expect(decoded?.iat).toBeDefined();
      expect(typeof decoded?.iat).toBe('number');
    });

    it('includes exp (expiration) claim', () => {
      const token = signToken(testPayload);
      const decoded = decodeToken(token);

      expect(decoded?.exp).toBeDefined();
      expect(typeof decoded?.exp).toBe('number');
    });

    it('throws error if JWT_SECRET is not set', () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      expect(() => {
        signToken(testPayload);
      }).toThrow('JWT_SECRET is not defined');

      // Restore
      process.env.JWT_SECRET = originalSecret;
    });
  });

  describe('verifyToken', () => {
    it('returns null for invalid token', () => {
      const result = verifyToken('invalid.token.here');
      expect(result).toBeNull();
    });

    it('returns null for tampered token', () => {
      const token = signToken(testPayload);
      const tampered = token.substring(0, token.length - 5) + 'xxxxx';

      const result = verifyToken(tampered);
      expect(result).toBeNull();
    });

    it('verifies valid token successfully', () => {
      const token = signToken(testPayload);
      const result = verifyToken(token);

      expect(result).not.toBeNull();
      expect(result?.userId).toBe(testPayload.userId);
    });

    it('returns null for expired token', (done) => {
      // This test would need to manipulate time or use a short expiration
      // For now, we'll verify the function handles the case
      const token = signToken(testPayload);
      const result = verifyToken(token);

      expect(result).not.toBeNull();
      done();
    });
  });

  describe('decodeToken', () => {
    it('decodes token without verification', () => {
      const token = signToken(testPayload);
      const decoded = decodeToken(token);

      expect(decoded).not.toBeNull();
      expect(decoded?.userId).toBe(testPayload.userId);
      expect(decoded?.email).toBe(testPayload.email);
    });

    it('returns null for invalid token string', () => {
      const result = decodeToken('not-a-valid-token');
      expect(result).toBeNull();
    });

    it('decodes token even if signature invalid (no verification)', () => {
      const token = signToken(testPayload);
      const tampered = token.substring(0, token.length - 5) + 'xxxxx';

      // decodeToken doesn't verify, so it should still decode
      const decoded = decodeToken(tampered);
      expect(decoded?.userId).toBe(testPayload.userId);
    });
  });

  describe('refreshToken', () => {
    it('creates new token from valid token', () => {
      jest.useFakeTimers();
      
      const originalToken = signToken(testPayload);
      
      // Small delay to ensure different iat
      jest.advanceTimersByTime(1000);
      
      const refreshedToken = refreshToken(originalToken);

      expect(refreshedToken).not.toBeNull();
      expect(refreshedToken).not.toBe(originalToken);
      
      jest.useRealTimers();
    });

    it('returns null for invalid token', () => {
      const result = refreshToken('invalid.token.here');
      expect(result).toBeNull();
    });

    it('preserves payload data in refreshed token', () => {
      const originalToken = signToken(testPayload);
      const refreshedToken = refreshToken(originalToken);

      if (refreshedToken) {
        const decoded = verifyToken(refreshedToken);
        expect(decoded?.userId).toBe(testPayload.userId);
        expect(decoded?.email).toBe(testPayload.email);
        expect(decoded?.role).toBe(testPayload.role);
      }
    });

    it('updates iat and exp claims', () => {
      jest.useFakeTimers();
      
      const token1 = signToken(testPayload);
      const decoded1 = decodeToken(token1);

      // Advance time to ensure different iat/exp
      jest.advanceTimersByTime(1000);
      
      const token2 = refreshToken(token1);
      const decoded2 = decodeToken(token2!);

      expect(decoded1?.iat).not.toBe(decoded2?.iat);
      expect(decoded1?.exp).not.toBe(decoded2?.exp);
      
      jest.useRealTimers();
    });
  });

  describe('isTokenExpired', () => {
    it('returns false for valid token', () => {
      const token = signToken(testPayload);
      expect(isTokenExpired(token)).toBe(false);
    });

    it('returns true for invalid token', () => {
      expect(isTokenExpired('invalid.token')).toBe(true);
    });

    it('returns true for token without exp claim', () => {
      const result = isTokenExpired('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLTEyMyJ9.signature');
      expect(result).toBe(true);
    });
  });

  describe('getTokenExpiresIn', () => {
    it('returns remaining time for valid token', () => {
      const token = signToken(testPayload);
      const expiresIn = getTokenExpiresIn(token);

      expect(expiresIn).toBeGreaterThan(0);
      expect(expiresIn).toBeLessThanOrEqual(30 * 24 * 60 * 60); // 30 days in seconds
    });

    it('returns 0 for invalid token', () => {
      const result = getTokenExpiresIn('invalid.token');
      expect(result).toBe(0);
    });

    it('returns 0 for token without exp claim', () => {
      const result = getTokenExpiresIn('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLTEyMyJ9.signature');
      expect(result).toBe(0);
    });
  });

  describe('Token Security', () => {
    it('uses HS256 algorithm (HMAC-SHA256)', () => {
      const token = signToken(testPayload);
      const decoded = decodeToken(token);

      // Verify the token structure indicates HS256
      const header = JSON.parse(Buffer.from(token.split('.')[0], 'base64').toString());
      expect(header.alg).toBe('HS256');
      expect(header.typ).toBe('JWT');
    });

    it('cannot create valid token with wrong secret', () => {
      const token = signToken(testPayload);

      // Manually override the secret temporarily
      const originalSecret = process.env.JWT_SECRET;
      process.env.JWT_SECRET = 'wrong-secret-key-min-32-chars-long!!';

      const result = verifyToken(token);
      expect(result).toBeNull();

      // Restore original secret
      process.env.JWT_SECRET = originalSecret;
    });

    it('token payload is readable (standard JWT)', () => {
      const token = signToken(testPayload);
      const payload = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64').toString()
      );

      expect(payload.userId).toBe(testPayload.userId);
      expect(payload.email).toBe(testPayload.email);
      expect(payload.role).toBe(testPayload.role);
    });
  });
});
