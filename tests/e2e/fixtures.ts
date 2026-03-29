import { test as base, Page } from '@playwright/test';

/**
 * Extended fixtures for E2E tests
 * Provides utility functions for common operations
 */

interface TestFixtures {
  authenticatedPage: Page;
  testUser: {
    email: string;
    password: string;
    code: string;
  };
}

/**
 * Fixture: authenticatedPage
 * Logs in a test user before each test
 */
export const test = base.extend<TestFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // This would implement login flow
    // For now, just provide the page
    await use(page);
  },

  testUser: async (_, use) => {
    // Return a test user object
    await use({
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      code: '123456',
    });
  },
});

export { expect } from '@playwright/test';

/**
 * Helper: fillRegisterForm
 * Fills out the registration form
 */
export async function fillRegisterForm(
  page: Page,
  data: {
    email: string;
    password: string;
    name: string;
    userType?: 'human' | 'ai_agent';
  }
) {
  await page.fill('input[name="email"]', data.email);
  await page.fill('input[name="password"]', data.password);
  if (data.name) {
    await page.fill('input[name="name"]', data.name);
  }
  if (data.userType) {
    await page.selectOption('select[name="userType"]', data.userType);
  }
}

/**
 * Helper: fillLoginForm
 * Fills out the login form
 */
export async function fillLoginForm(
  page: Page,
  email: string,
  password: string
) {
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
}

/**
 * Helper: submitForm
 * Submits a form by clicking the submit button
 */
export async function submitForm(page: Page) {
  const submitButton = page.locator('button[type="submit"]');
  await submitButton.click();
}

/**
 * Helper: expectError
 * Checks for error message on the page
 */
export async function expectError(page: Page, errorPattern: RegExp) {
  const errorElement = page.locator(`text=${errorPattern}`);
  await errorElement.waitFor({ state: 'visible', timeout: 5000 });
}

/**
 * Helper: expectSuccess
 * Checks for success message or redirect
 */
export async function expectSuccess(page: Page, urlPattern: RegExp) {
  await page.waitForURL(urlPattern, { timeout: 5000 });
}
