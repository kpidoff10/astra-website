import { VALIDATION, AUTH_ERRORS, USER_ROLES } from '@/lib/constants';

describe('Constants - Validation', () => {
  describe('EMAIL_REGEX', () => {
    it('validates correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'test+tag@example.com',
        'kevin.pidoff@example.com',
      ];

      validEmails.forEach((email) => {
        expect(VALIDATION.EMAIL_REGEX.test(email)).toBe(true);
      });
    });

    it('rejects invalid email addresses', () => {
      const invalidEmails = [
        'test@',
        '@example.com',
        'test example@domain.com',
        'test@.com',
      ];

      invalidEmails.forEach((email) => {
        expect(VALIDATION.EMAIL_REGEX.test(email)).toBe(false);
      });
    });
  });

  describe('PASSWORD_REGEX', () => {
    it('validates strong passwords with uppercase, lowercase, and numbers', () => {
      const validPasswords = [
        'Password123',
        'Kevin.pidoff10',
        'Astra2026',
        'Test@Password1',
        'MyP4ssw0rd',
        'Admin_2026',
      ];

      validPasswords.forEach((password) => {
        expect(VALIDATION.PASSWORD_REGEX.test(password)).toBe(true);
      });
    });

    it('rejects weak passwords', () => {
      const weakPasswords = [
        'password123', // no uppercase
        'PASSWORD123', // no lowercase
        'Password', // no number
        'Pass123', // only 7 chars
        'Pass.word', // no number
        'PASS1234', // no lowercase
      ];

      weakPasswords.forEach((password) => {
        expect(VALIDATION.PASSWORD_REGEX.test(password)).toBe(false);
      });
    });

    it('accepts special characters in passwords', () => {
      const specialPasswords = [
        'Pass@word1',
        'Test$123',
        'Secure!Pass2',
        'Complex%Pass1',
      ];

      specialPasswords.forEach((password) => {
        expect(VALIDATION.PASSWORD_REGEX.test(password)).toBe(true);
      });
    });
  });

  describe('PASSWORD_MIN_LENGTH', () => {
    it('should be 8 characters', () => {
      expect(VALIDATION.PASSWORD_MIN_LENGTH).toBe(8);
    });
  });
});

describe('Constants - Auth Errors', () => {
  it('has all required error messages', () => {
    expect(AUTH_ERRORS.INVALID_CREDENTIALS).toBeDefined();
    expect(AUTH_ERRORS.EMAIL_EXISTS).toBeDefined();
    expect(AUTH_ERRORS.INVALID_EMAIL).toBeDefined();
    expect(AUTH_ERRORS.PASSWORD_TOO_SHORT).toBeDefined();
    expect(AUTH_ERRORS.PASSWORD_WEAK).toBeDefined();
    expect(AUTH_ERRORS.UNAUTHORIZED).toBeDefined();
  });

  it('error messages are in French', () => {
    expect(AUTH_ERRORS.INVALID_CREDENTIALS).toContain('incorrect');
    expect(AUTH_ERRORS.EMAIL_EXISTS).toContain('email');
  });
});

describe('Constants - User Roles', () => {
  it('has all required roles', () => {
    expect(USER_ROLES.USER).toBe('USER');
    expect(USER_ROLES.AI_AGENT).toBe('AI_AGENT');
    expect(USER_ROLES.ADMIN).toBe('ADMIN');
  });

  it('roles are well defined', () => {
    expect(Object.keys(USER_ROLES).length).toBe(3);
  });
});
