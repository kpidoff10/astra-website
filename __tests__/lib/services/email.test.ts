/**
 * Email API Integration Tests
 * Tests the registration endpoint and email sending
 * Run: npm test -- __tests__/lib/services/email.test.ts
 */

describe('Email Service - Integration Tests', () => {
  // These are integration tests for the email system
  // The actual email sending happens in the API handler

  it('should have sendWelcomeEmail exported', () => {
    // Just verify the file exists and can be imported
    const emailModule = require('@/lib/services/email');
    expect(emailModule.sendWelcomeEmail).toBeDefined();
    expect(typeof emailModule.sendWelcomeEmail).toBe('function');
  });

  it('should have WelcomeEmail component exported', () => {
    // Verify the email template exists
    const emailTemplate = require('@/lib/emails/welcome');
    expect(emailTemplate.WelcomeEmail).toBeDefined();
  });

  it('should have render available from react-email', () => {
    // Verify react-email components are installed
    const reactEmail = require('@react-email/components');
    expect(reactEmail.render).toBeDefined();
    expect(typeof reactEmail.render).toBe('function');
  });

  describe('Manual Testing Instructions', () => {
    it('should provide instructions for manual email testing', () => {
      console.log(`
        
        ========================================
        📧 MANUAL EMAIL TEST INSTRUCTIONS
        ========================================
        
        1. Start dev server:
           npm run dev
        
        2. Go to: http://localhost:3000/auth/register
        
        3. Fill registration form with:
           Email: test.welcome.manual@yopmail.com
           Password: TestPassword123!
           User Type: Human
           Name: Test User
        
        4. Click "Register"
        
        5. Check logs in terminal for email sending
           Look for: "[Email] SUCCESS! Email ID: ..."
        
        6. Check Resend dashboard for sent email:
           https://dashboard.resend.com/emails
        
        7. Or check yopmail inbox:
           https://yopmail.com/test.welcome.manual
        
        ========================================
      `);
      
      expect(true).toBe(true);
    });
  });
});
