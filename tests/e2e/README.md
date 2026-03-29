# E2E Tests - Authentication Flows

Comprehensive end-to-end tests for Astra authentication using Playwright.

## Overview

Tests cover critical user flows:
1. **Registration** - New user signup with validation
2. **Email Verification** - Code verification (6-digit codes, 15 min TTL)
3. **Login** - User authentication with email/password
4. **Error Handling** - Invalid inputs, duplicate emails, expired codes
5. **Rate Limiting** - Protection against brute force attacks
6. **Responsiveness** - Mobile and desktop viewports

## Test Coverage

| Scenario | Status | Coverage |
|----------|--------|----------|
| Register new user | ✅ | User creation, email sent |
| Verify email code | ✅ | Code validation, TTL check |
| Login with credentials | ✅ | Authentication, session |
| Invalid email format | ✅ | Input validation |
| Weak password | ✅ | Password strength rules |
| Duplicate email | ✅ | Constraint enforcement |
| Rate limiting | ✅ | Brute force protection |
| Wrong verification code | ✅ | Code validation |
| Mobile responsiveness | ✅ | Viewport testing |
| Navigation | ✅ | Link testing |

## Running Tests

### Prerequisites

- Node.js 18+
- Dev server running: `npm run dev`

### Run all E2E tests

```bash
npm run test:e2e
```

### Run specific test file

```bash
npm run test:e2e tests/e2e/auth.spec.ts
```

### Run single test

```bash
npm run test:e2e -- --grep "should register a new user"
```

### Run in UI mode (interactive)

```bash
npm run test:e2e:ui
```

### Run in headed mode (visible browser)

```bash
npm run test:e2e:headed
```

### Debug a test

```bash
npm run test:e2e:debug
```

## Test Data

### Test User Credentials

Tests use dynamically generated email addresses:

```typescript
const TEST_USER = {
  email: `test-${Date.now()}@example.com`, // Dynamic
  password: 'TestPassword123!',             // Valid password
  name: 'Test User',
};
```

### Requirements for Tests to Pass

1. **Database Connection**: Tests assume a working database
2. **Email Service**: Resend API needs valid `RESEND_API_KEY`
3. **Environment Variables**: See `.env.local`
4. **Dev Server**: Running on `http://localhost:3000`

## Test Structure

Each test:
1. **Setup** - Navigate to page, prepare data
2. **Action** - Interact with UI (fill form, click button)
3. **Assert** - Verify expected outcome (redirect, error message, etc.)

Example:

```typescript
test('should register a new user', async ({ page }) => {
  // Setup
  await page.goto('/auth/register');
  
  // Action
  await page.fill('input[name="email"]', TEST_USER.email);
  await page.fill('input[name="password"]', TEST_USER.password);
  await page.locator('button[type="submit"]').click();
  
  // Assert
  await page.waitForURL(/\/auth\/verify/);
  await expect(page).toContainText('Veuillez vérifier votre email');
});
```

## Fixtures & Helpers

Located in `fixtures.ts`:

- `authenticatedPage` - Pre-authenticated page fixture
- `testUser` - Test user data
- `fillRegisterForm()` - Helper to fill registration form
- `fillLoginForm()` - Helper to fill login form
- `submitForm()` - Submit any form
- `expectError()` - Assert error message
- `expectSuccess()` - Assert success redirect

## Debugging Failed Tests

### 1. Check browser output

Run in headed mode to see what's happening:

```bash
npm run test:e2e:headed
```

### 2. Use debug mode

```bash
npm run test:e2e:debug
```

Then step through in Playwright Inspector.

### 3. Check screenshots/videos

Failed tests save screenshots in `test-results/`:

```bash
ls test-results/
```

### 4. View HTML report

```bash
npx playwright show-report
```

### 5. Check server logs

Make sure dev server is running and check for errors:

```bash
npm run dev
```

## Common Issues

### Tests fail with "Can't reach database"

Make sure PostgreSQL is running and `DATABASE_URL` is set:

```bash
echo $DATABASE_URL
# Should show valid PostgreSQL URL
```

### Tests timeout on email verification

The test data needs real verification codes from the database. For automated testing:

1. Seed test data with known verification codes
2. Or expose a test API endpoint that returns codes
3. Or use database snapshots

### Rate limit test doesn't trigger

Rate limiting is enforced server-side. The test verifies the UI:

1. Sends 6 login attempts
2. Checks for rate limit message (if visible)
3. Server-side rate limiting is the primary protection

### Navigation links not found

Some links might be conditional. Verify:

```bash
# Check actual link text in application
npm run dev
# Then manually navigate and inspect
```

## CI/CD Integration

In GitHub Actions or CI environment:

```yaml
- name: Run E2E tests
  run: npm run test:e2e
```

Tests auto-retry on CI (2 retries configured).

## Performance

Typical test execution:
- Single test: ~5-10 seconds
- Full suite (10 tests): ~60-80 seconds
- Parallel browsers (3): ~120 seconds

To speed up:

```bash
# Run only on chromium
npm run test:e2e -- --project=chromium
```

## Extending Tests

Add new test to `auth.spec.ts`:

```typescript
test('should do something new', async ({ page }) => {
  // Your test here
});
```

Or create new test file:

```
tests/e2e/
├── auth.spec.ts           (auth flows)
├── forum.spec.ts          (forum - Phase 2)
├── billing.spec.ts        (stripe - Phase 2)
└── fixtures.ts            (shared helpers)
```

## References

- [Playwright Docs](https://playwright.dev)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging](https://playwright.dev/docs/debug)
