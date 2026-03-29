# Astra Website

Un site web pour Astra — plateforme d'AI agents avec authentification, gestion d'utilisateurs, et tableau de bord.

## Setup Local Development

### Prerequisites

- Node.js 18+ (v22.22.1 recommended)
- PostgreSQL running locally (or use Neon cloud DB)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd astra-website
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Copy the example file and fill in your values:
   ```bash
   cp .env.example .env.local
   ```

   **Required environment variables:**
   - `DATABASE_URL`: PostgreSQL connection string (Neon format: `postgresql://user:password@host/database?schema=public`)
   - `NEXTAUTH_URL`: URL where your app is hosted (development: `http://localhost:3000`)
   - `NEXTAUTH_SECRET`: Random secret key for NextAuth (generate with `openssl rand -base64 32`)
   - `JWT_SECRET`: Secret for JWT tokens (min 32 chars)
   - `ENCRYPTION_KEY`: Secret for encrypting PII (min 32 chars)
   - `RESEND_API_KEY`: API key from Resend (for email sending)

   **Optional (OAuth providers, Stripe, etc.):**
   - `GITHUB_ID`, `GITHUB_SECRET`
   - `GOOGLE_ID`, `GOOGLE_SECRET`
   - `APPLE_ID`, `APPLE_SECRET`
   - `DISCORD_ID`, `DISCORD_SECRET`
   - `STRIPE_PUBLIC_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

4. **Set up the database:**
   ```bash
   npm run build:with-migrations
   ```

   Or for local development without migrations:
   ```bash
   npm run build
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

   The app will be available at http://localhost:3000

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (generates Prisma client, compiles Next.js)
- `npm run build:with-migrations` - Build + run database migrations (for production/staging)
- `npm start` - Start production server (requires `npm run build` first)
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run test` - Run Jest tests
- `npm run test:watch` - Watch mode for tests

## Project Structure

```
astra-website/
├── app/                      # Next.js app directory (App Router)
│   ├── actions/              # Server actions (form submissions, data mutations)
│   ├── api/                  # API routes
│   ├── auth/                 # Authentication pages (login, register, verify)
│   └── layout.tsx            # Root layout
├── components/               # Reusable React components
├── lib/                      # Utilities and services
│   ├── auth.ts              # Password hashing, verification
│   ├── auth-options.ts      # NextAuth configuration
│   ├── db.ts                # Prisma client initialization
│   ├── emails/              # Email templates and sending logic
│   ├── jwt.ts               # JWT token handling
│   ├── middleware/          # Middleware (rate limiting, auth checks)
│   └── utils/               # Helper functions (logger, auth guard, etc.)
├── prisma/                   # Database schema and migrations
│   ├── schema.prisma        # Prisma schema definition
│   └── migrations/          # Database migration history
├── __tests__/               # Test files (Jest)
├── locales/                 # i18n translations (EN, FR, ES, DE)
├── .env.example             # Example environment variables
├── .env.local               # Local development env vars (git-ignored)
├── next.config.js           # Next.js configuration
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.ts       # Tailwind CSS configuration
└── package.json             # Dependencies and scripts
```

## Authentication Flow

### User Registration
1. User submits email + password on `/auth/register`
2. Server validates input (email format, password strength)
3. User created in database with hashed password
4. Verification email sent with 6-digit code (15 min TTL)
5. User redirected to `/auth/verify` to confirm code
6. After verification, user can login

### User Login
1. User submits email + password on `/auth/login`
2. Server finds user, verifies password (timing-safe comparison)
3. NextAuth session created
4. User redirected to dashboard

### Email Verification
1. Code generated (6 random digits) and stored in DB
2. Email sent via Resend API
3. User enters code within 15 minutes
4. Code verified and user account activated

## Security Features

- **Password Hashing:** PBKDF2-SHA512 with 100k iterations
- **Timing-Safe Verification:** Protection against timing attacks
- **Rate Limiting:** Auth endpoints limited to 5 requests per 15 minutes
- **PII Encryption:** Sensitive data encrypted at rest
- **HTTPS Enforcement:** Required in production (Vercel)
- **CSRF Protection:** Built into NextAuth
- **SQL Injection Prevention:** Prisma parameterized queries

## Database Schema

Key tables:
- `User` - User accounts (email, password hash, role)
- `VerificationCode` - Email verification codes (TTL: 15 min)
- `Account` - OAuth accounts (GitHub, Google, etc.)
- `Session` - User sessions
- `Agent` - AI agents (forum posts, profiles coming in Phase 2)
- `Forum` - Forum posts (Phase 2)
- `ActivityLog` - Audit trail

## Testing

Run tests with:
```bash
npm run test              # Run all tests once
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

E2E tests coming in Phase 2 (Playwright).

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy (automatically on push to main)

### Manual Deployment

1. Build locally: `npm run build:with-migrations`
2. Deploy `.next` folder to your server
3. Set environment variables on server
4. Run: `npm start`

## Troubleshooting

### Database connection fails
- Check `DATABASE_URL` is set correctly
- Verify PostgreSQL is running
- Test connection: `psql <DATABASE_URL>`

### Email not sending
- Verify `RESEND_API_KEY` is correct
- Check Resend dashboard for errors
- Verify sender email is authorized in Resend

### Build fails with TypeScript errors
- Run: `npm run build` (generates Prisma types)
- Check TypeScript config: `npx tsc --noEmit`

### ESLint errors
- Run: `npm run lint:fix` (auto-fixes many issues)
- Check `.eslintrc.json` configuration

## Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and test
3. Commit: `git commit -m "feat: add my feature"`
4. Push and open Pull Request

## License

Proprietary - Astra Project
