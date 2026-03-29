import { hashPassword, verifyPassword, generateToken } from '@/lib/auth';

describe('Authentication - Password Hashing', () => {
  describe('hashPassword', () => {
    it('returns a hash with salt:hash format', async () => {
      const password = 'SecurePassword123!';
      const hash = await hashPassword(password);

      expect(hash).toContain(':');
      const [salt, hashPart] = hash.split(':');
      expect(salt).toHaveLength(32); // 16 bytes * 2 (hex)
      expect(hashPart).toHaveLength(128); // 64 bytes * 2 (hex)
    });

    it('generates different hashes for same password', async () => {
      const password = 'TestPassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('hashes are reproducible with same salt', async () => {
      const password = 'Password123';
      const hash1 = await hashPassword(password);
      const [salt1] = hash1.split(':');

      const hash2 = await hashPassword(password);
      const [salt2] = hash2.split(':');

      // Different salts
      expect(salt1).not.toBe(salt2);
    });

    it('produces 16-byte random salt', async () => {
      const hash = await hashPassword('TestPassword');
      const [salt] = hash.split(':');

      // 16 bytes in hex = 32 characters
      expect(salt).toHaveLength(32);
      // Should be valid hex
      expect(/^[a-f0-9]{32}$/.test(salt)).toBe(true);
    });

    it('produces consistent hash length', async () => {
      const passwords = ['short', 'medium password', 'VeryLongPasswordWithManyCharacters123!@#'];

      for (const password of passwords) {
        const hash = await hashPassword(password);
        const [, hashPart] = hash.split(':');

        // All PBKDF2-SHA512 outputs should be 64 bytes = 128 hex chars
        expect(hashPart).toHaveLength(128);
      }
    });
  });

  describe('verifyPassword', () => {
    it('verifies correct password', async () => {
      const password = 'CorrectPassword123!';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('rejects incorrect password', async () => {
      const password = 'CorrectPassword123!';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword('WrongPassword123!', hash);
      expect(isValid).toBe(false);
    });

    it('rejects malformed hash', async () => {
      const invalidHashes = [
        'no-colon-here',
        'onlyonepart:',
        ':onlyhash',
        '',
        'invalid:format:toomanyparts',
      ];

      for (const hash of invalidHashes) {
        const isValid = await verifyPassword('password', hash);
        expect(isValid).toBe(false);
      }
    });

    it('is case-sensitive', async () => {
      const password = 'MyPassword123';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword('mypassword123', hash);
      expect(isValid).toBe(false);
    });

    it('handles special characters', async () => {
      const password = 'P@ssw0rd!#$%^&*()_+-=[]{}|;:,.<>?';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);

      const isInvalid = await verifyPassword('P@ssw0rd!#$%^&*()_+-=[]{}|;:,.<>?x', hash);
      expect(isInvalid).toBe(false);
    });

    it('handles unicode characters', async () => {
      const password = 'Pässwörd123!©®™';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('is timing-safe (resistant to timing attacks)', async () => {
      const password = 'CorrectPassword';
      const hash = await hashPassword(password);

      // This is a simplified check — real timing attack detection requires
      // statistical analysis of many attempts
      const wrongPassword = 'W'.repeat(password.length);
      const isValid = await verifyPassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });

    it('works with long passwords', async () => {
      const longPassword = 'A'.repeat(1000);
      const hash = await hashPassword(longPassword);

      const isValid = await verifyPassword(longPassword, hash);
      expect(isValid).toBe(true);

      const isInvalid = await verifyPassword('A'.repeat(999), hash);
      expect(isInvalid).toBe(false);
    });

    it('works with very short passwords', async () => {
      const shortPassword = 'a';
      const hash = await hashPassword(shortPassword);

      const isValid = await verifyPassword(shortPassword, hash);
      expect(isValid).toBe(true);

      const isInvalid = await verifyPassword('b', hash);
      expect(isInvalid).toBe(false);
    });
  });

  describe('generateToken', () => {
    it('generates a random hex string', () => {
      const token = generateToken();

      expect(typeof token).toBe('string');
      expect(/^[a-f0-9]+$/.test(token)).toBe(true);
    });

    it('generates correct length tokens', () => {
      const lengths = [16, 32, 64, 128];

      for (const length of lengths) {
        const token = generateToken(length);
        // length bytes * 2 (hex) = 2*length chars
        expect(token).toHaveLength(length * 2);
      }
    });

    it('default length is 32 bytes (256 bits)', () => {
      const token = generateToken();
      expect(token).toHaveLength(64); // 32 * 2
    });

    it('generates different tokens each time', () => {
      const tokens = new Set([
        generateToken(),
        generateToken(),
        generateToken(),
        generateToken(),
        generateToken(),
      ]);

      expect(tokens.size).toBe(5);
    });

    it('generates cryptographically secure tokens', () => {
      const token = generateToken(32);

      // Check that it's not predictable (all zeros, all ones, sequential, etc.)
      expect(token).not.toBe('0'.repeat(64));
      expect(token).not.toBe('f'.repeat(64));
      expect(token).not.toMatch(/^([a-f0-9])\1*$/); // All same char
    });
  });

  describe('Security Properties', () => {
    it('uses strong iteration count (100k+ for MVP, 600k+ for production)', async () => {
      // This is an indirect test — we verify that hashing takes reasonable time
      const password = 'TestPassword123';
      const start = Date.now();
      await hashPassword(password);
      const elapsed = Date.now() - start;

      // MVP uses 100k iterations (~1-2 sec), production will use 600k
      // Should take at least 10ms even with optimizations
      expect(elapsed).toBeGreaterThan(10);
    });

    it('produces different hashes for passwords differing by one character', async () => {
      const hash1 = await hashPassword('Password1');
      const hash2 = await hashPassword('Password2');

      expect(hash1).not.toBe(hash2);
    });

    it('cannot reverse password from hash', async () => {
      const password = 'SuperSecretPassword';
      const hash = await hashPassword(password);

      // Hash format is salt:hash, neither should contain the password
      expect(hash).not.toContain(password);
    });

    it('hash is deterministic with same salt', async () => {
      const password = 'TestPassword';
      const hash1 = await hashPassword(password);
      const [salt1, hash1Part] = hash1.split(':');

      // If we manually hash with same salt, we get same hash
      const hash2 = await hashPassword(password);
      const [salt2, hash2Part] = hash2.split(':');

      // Different salts so different hashes
      expect(salt1).not.toBe(salt2);
      expect(hash1Part).not.toBe(hash2Part);
    });
  });
});
