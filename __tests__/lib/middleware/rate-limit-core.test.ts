import {
  checkRateLimit,
  clearRateLimitStore,
  getRateLimitInfo,
} from '@/lib/middleware/rate-limit';

describe('Rate Limiting Core Logic', () => {
  beforeEach(() => {
    clearRateLimitStore();
    jest.clearAllTimers();
  });

  describe('checkRateLimit', () => {
    it('allows requests within limit', () => {
      const result1 = checkRateLimit('127.0.0.1', {
        windowMs: 60000,
        maxRequests: 3,
      });
      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(2);

      const result2 = checkRateLimit('127.0.0.1', {
        windowMs: 60000,
        maxRequests: 3,
      });
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(1);

      const result3 = checkRateLimit('127.0.0.1', {
        windowMs: 60000,
        maxRequests: 3,
      });
      expect(result3.allowed).toBe(true);
      expect(result3.remaining).toBe(0);
    });

    it('blocks requests exceeding limit', () => {
      // Make 2 requests (limit is 2)
      checkRateLimit('192.168.1.1', {
        windowMs: 60000,
        maxRequests: 2,
      });

      checkRateLimit('192.168.1.1', {
        windowMs: 60000,
        maxRequests: 2,
      });

      // 3rd request should be blocked
      const result = checkRateLimit('192.168.1.1', {
        windowMs: 60000,
        maxRequests: 2,
      });

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('returns correct retryAfter value', () => {
      const result = checkRateLimit('10.0.0.1', {
        windowMs: 60000,
        maxRequests: 1,
      });

      // First request allowed
      expect(result.allowed).toBe(true);
      expect(result.retryAfter).toBe(0);

      // Second request blocked
      const blockedResult = checkRateLimit('10.0.0.1', {
        windowMs: 60000,
        maxRequests: 1,
      });

      expect(blockedResult.allowed).toBe(false);
      expect(blockedResult.retryAfter).toBeGreaterThan(0);
      expect(blockedResult.retryAfter).toBeLessThanOrEqual(60);
    });

    it('uses custom error message', () => {
      const customMessage = 'Custom rate limit message';

      // Exceed limit
      checkRateLimit('203.0.113.1', {
        windowMs: 60000,
        maxRequests: 1,
        message: customMessage,
      });

      const result = checkRateLimit('203.0.113.1', {
        windowMs: 60000,
        maxRequests: 1,
        message: customMessage,
      });

      expect(result.allowed).toBe(false);
      expect(result.message).toBe(customMessage);
    });

    it('resets counter after time window expires', () => {
      jest.useFakeTimers();

      // First request - allowed
      let result = checkRateLimit('172.16.0.1', {
        windowMs: 60000,
        maxRequests: 1,
      });
      expect(result.allowed).toBe(true);

      // Second request - blocked
      result = checkRateLimit('172.16.0.1', {
        windowMs: 60000,
        maxRequests: 1,
      });
      expect(result.allowed).toBe(false);

      // Advance time past window
      jest.advanceTimersByTime(61000);

      // Third request - allowed (after reset)
      result = checkRateLimit('172.16.0.1', {
        windowMs: 60000,
        maxRequests: 1,
      });
      expect(result.allowed).toBe(true);

      jest.useRealTimers();
    });

    it('handles multiple IPs independently', () => {
      // IP 1 - make 1 request
      const r1_1 = checkRateLimit('1.1.1.1', {
        windowMs: 60000,
        maxRequests: 1,
      });
      expect(r1_1.allowed).toBe(true);

      // IP 2 - make 1 request
      const r2_1 = checkRateLimit('2.2.2.2', {
        windowMs: 60000,
        maxRequests: 1,
      });
      expect(r2_1.allowed).toBe(true);

      // IP 1 - 2nd request should be blocked
      const r1_2 = checkRateLimit('1.1.1.1', {
        windowMs: 60000,
        maxRequests: 1,
      });
      expect(r1_2.allowed).toBe(false);

      // IP 2 - 2nd request should be blocked
      const r2_2 = checkRateLimit('2.2.2.2', {
        windowMs: 60000,
        maxRequests: 1,
      });
      expect(r2_2.allowed).toBe(false);
    });

    it('handles auth endpoint strict limits', () => {
      const authOptions = {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 5, // Max 5 attempts
      };

      // Allow 5 requests
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit('192.168.1.100', authOptions);
        expect(result.allowed).toBe(true);
      }

      // Block 6th request
      const blockedResult = checkRateLimit('192.168.1.100', authOptions);
      expect(blockedResult.allowed).toBe(false);
    });

    it('includes message in blocked response', () => {
      const message = 'Trop de tentatives';

      checkRateLimit('1.2.3.4', {
        windowMs: 60000,
        maxRequests: 1,
        message,
      });

      const result = checkRateLimit('1.2.3.4', {
        windowMs: 60000,
        maxRequests: 1,
        message,
      });

      expect(result.allowed).toBe(false);
      expect(result.message).toBe(message);
    });
  });

  describe('getRateLimitInfo', () => {
    it('returns null for unknown IP', () => {
      const info = getRateLimitInfo('0.0.0.0');
      expect(info).toBeNull();
    });

    it('returns rate limit info for tracked IP', () => {
      checkRateLimit('100.100.100.100', {
        windowMs: 60000,
        maxRequests: 5,
      });

      checkRateLimit('100.100.100.100', {
        windowMs: 60000,
        maxRequests: 5,
      });

      const info = getRateLimitInfo('100.100.100.100');
      expect(info).not.toBeNull();
      expect(info?.count).toBe(2);
      expect(info?.resetTime).toBeGreaterThan(Date.now());
    });
  });

  describe('clearRateLimitStore', () => {
    it('clears all rate limit records', () => {
      checkRateLimit('111.111.111.111', {
        windowMs: 60000,
        maxRequests: 1,
      });

      expect(getRateLimitInfo('111.111.111.111')).not.toBeNull();

      clearRateLimitStore();

      expect(getRateLimitInfo('111.111.111.111')).toBeNull();
    });
  });
});
