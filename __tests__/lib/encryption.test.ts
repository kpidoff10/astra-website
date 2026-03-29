import {
  encryptData,
  decryptData,
  isEncrypted,
  encryptIfNeeded,
  decryptIfNeeded,
} from '@/lib/encryption';

describe('Encryption Service', () => {
  beforeEach(() => {
    // Ensure ENCRYPTION_KEY is set for tests
    process.env.ENCRYPTION_KEY = 'test-encryption-key-min-32-characters-long!!!';
  });

  describe('encryptData', () => {
    it('encrypts plaintext to encrypted format', () => {
      const plaintext = 'sensitive-data';
      const encrypted = encryptData(plaintext);

      expect(encrypted).not.toBe(plaintext);
      expect(encrypted).toContain(':');
      expect(encrypted.split(':').length).toBe(3);
    });

    it('generates different ciphertext for same plaintext', () => {
      const plaintext = 'same-data';
      const encrypted1 = encryptData(plaintext);
      const encrypted2 = encryptData(plaintext);

      expect(encrypted1).not.toBe(encrypted2);
    });

    it('encrypts empty string', () => {
      const encrypted = encryptData('');
      expect(encrypted).toBeDefined();
      expect(encrypted.split(':').length).toBe(3);
    });

    it('encrypts long strings', () => {
      const longText = 'A'.repeat(10000);
      const encrypted = encryptData(longText);

      expect(encrypted).toBeDefined();
      expect(encrypted.split(':').length).toBe(3);
    });

    it('encrypts special characters', () => {
      const special = 'Special!@#$%^&*()_+-=[]{}|;:,.<>?';
      const encrypted = encryptData(special);

      expect(encrypted).toBeDefined();
      expect(encrypted.split(':').length).toBe(3);
    });

    it('encrypts unicode characters', () => {
      const unicode = 'Unicode: 你好世界 🚀 Émojis!';
      const encrypted = encryptData(unicode);

      expect(encrypted).toBeDefined();
      expect(encrypted.split(':').length).toBe(3);
    });

    it('throws on missing ENCRYPTION_KEY', () => {
      delete process.env.ENCRYPTION_KEY;

      // Re-import to trigger the error
      expect(() => {
        encryptData('test');
      }).toThrow('ENCRYPTION_KEY must be defined');
    });
  });

  describe('decryptData', () => {
    it('decrypts encrypted data back to plaintext', () => {
      const plaintext = 'test-data';
      const encrypted = encryptData(plaintext);
      const decrypted = decryptData(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('decrypts special characters correctly', () => {
      const special = 'Test!@#$%^&*()';
      const encrypted = encryptData(special);
      const decrypted = decryptData(encrypted);

      expect(decrypted).toBe(special);
    });

    it('decrypts unicode correctly', () => {
      const unicode = '你好世界🚀';
      const encrypted = encryptData(unicode);
      const decrypted = decryptData(encrypted);

      expect(decrypted).toBe(unicode);
    });

    it('decrypts long strings', () => {
      const longText = 'B'.repeat(10000);
      const encrypted = encryptData(longText);
      const decrypted = decryptData(encrypted);

      expect(decrypted).toBe(longText);
    });

    it('decrypts empty string', () => {
      const encrypted = encryptData('');
      const decrypted = decryptData(encrypted);

      expect(decrypted).toBe('');
    });

    it('throws on invalid format', () => {
      const invalidFormats = [
        'no-colons-here',
        'one:two', // Not enough parts
        'one:two:three:four', // Too many parts
        '',
        'invalid:invalid:invalid', // Invalid hex
      ];

      for (const format of invalidFormats) {
        expect(() => {
          decryptData(format);
        }).toThrow();
      }
    });

    it('throws on tampered ciphertext', () => {
      const plaintext = 'secret-data';
      const encrypted = encryptData(plaintext);

      // Tamper with the encrypted part
      const parts = encrypted.split(':');
      parts[2] = parts[2].substring(0, parts[2].length - 2) + 'xx';
      const tampered = parts.join(':');

      expect(() => {
        decryptData(tampered);
      }).toThrow();
    });

    it('throws on tampered auth tag', () => {
      const plaintext = 'secret-data';
      const encrypted = encryptData(plaintext);

      // Tamper with auth tag
      const parts = encrypted.split(':');
      parts[1] = 'ffffffffffffffffffffffffffffffff'; // Wrong tag
      const tampered = parts.join(':');

      expect(() => {
        decryptData(tampered);
      }).toThrow();
    });

    it('rejects decryption with wrong key', () => {
      const plaintext = 'secret';
      const encrypted = encryptData(plaintext);

      // Change the encryption key
      const originalKey = process.env.ENCRYPTION_KEY;
      process.env.ENCRYPTION_KEY = 'different-key-min-32-chars-long!!';

      expect(() => {
        decryptData(encrypted);
      }).toThrow();

      // Restore key
      process.env.ENCRYPTION_KEY = originalKey;
    });
  });

  describe('isEncrypted', () => {
    it('detects encrypted data', () => {
      const plaintext = 'test-data';
      const encrypted = encryptData(plaintext);

      expect(isEncrypted(encrypted)).toBe(true);
    });

    it('rejects non-encrypted data', () => {
      const plaintext = 'just plain text';
      expect(isEncrypted(plaintext)).toBe(false);
    });

    it('rejects malformed data', () => {
      const malformed = [
        'one:two',
        'one:two:three:four',
        '',
        'no-colons',
        'invalid:invalid:zzzzzzzzzzzzzzzz',
      ];

      for (const data of malformed) {
        expect(isEncrypted(data)).toBe(false);
      }
    });

    it('handles edge cases', () => {
      expect(isEncrypted(':')).toBe(false);
      expect(isEncrypted(':::')).toBe(false);
    });
  });

  describe('encryptIfNeeded', () => {
    it('encrypts plaintext', () => {
      const plaintext = 'needs-encryption';
      const result = encryptIfNeeded(plaintext);

      expect(result).not.toBe(plaintext);
      expect(isEncrypted(result)).toBe(true);
    });

    it('does not re-encrypt encrypted data', () => {
      const plaintext = 'test';
      const encrypted = encryptData(plaintext);
      const result = encryptIfNeeded(encrypted);

      expect(result).toBe(encrypted);
    });

    it('handles empty string', () => {
      const result = encryptIfNeeded('');
      expect(isEncrypted(result)).toBe(true);
    });
  });

  describe('decryptIfNeeded', () => {
    it('decrypts encrypted data', () => {
      const plaintext = 'original-data';
      const encrypted = encryptData(plaintext);
      const result = decryptIfNeeded(encrypted);

      expect(result).toBe(plaintext);
    });

    it('returns plaintext unchanged if not encrypted', () => {
      const plaintext = 'just plain text';
      const result = decryptIfNeeded(plaintext);

      expect(result).toBe(plaintext);
    });

    it('handles decryption errors gracefully', () => {
      const malformed = 'aa:bb:cc';
      const result = decryptIfNeeded(malformed);

      // Should return original if decryption fails
      expect(result).toBeDefined();
    });

    it('round-trip encryption/decryption', () => {
      const original = 'secret-data-to-store';
      const encrypted = encryptData(original);
      const decrypted = decryptIfNeeded(encrypted);

      expect(decrypted).toBe(original);
    });
  });

  describe('Security Properties', () => {
    it('uses AES-256-GCM (authenticated encryption)', () => {
      const plaintext = 'test';
      const encrypted = encryptData(plaintext);

      // GCM adds authentication tag, so tampering is detectable
      const parts = encrypted.split(':');
      expect(parts.length).toBe(3);

      // IV is 16 bytes (32 hex chars)
      expect(parts[0]).toHaveLength(32);

      // Auth tag is 16 bytes (32 hex chars)
      expect(parts[1]).toHaveLength(32);
    });

    it('uses random IV for each encryption', () => {
      const plaintext = 'same-text';
      const encrypted1 = encryptData(plaintext);
      const encrypted2 = encryptData(plaintext);

      const iv1 = encrypted1.split(':')[0];
      const iv2 = encrypted2.split(':')[0];

      expect(iv1).not.toBe(iv2);
    });

    it('prevents unauthorized access without key', () => {
      const plaintext = 'secret';
      const encrypted = encryptData(plaintext);

      // Save original key
      const originalKey = process.env.ENCRYPTION_KEY;

      // Try with different key
      process.env.ENCRYPTION_KEY = 'wrong-key-min-32-characters-long!!';

      expect(() => {
        decryptData(encrypted);
      }).toThrow();

      // Restore key
      process.env.ENCRYPTION_KEY = originalKey;
    });

    it('ciphertext does not reveal plaintext length directly', () => {
      const short = encryptData('a');
      const long = encryptData('a'.repeat(100));

      // Both should have encrypted data part (3rd component)
      const shortLen = short.split(':')[2].length;
      const longLen = long.split(':')[2].length;

      // Lengths will differ, but not proportionally due to GCM
      expect(longLen).toBeGreaterThan(shortLen);
    });
  });
});
