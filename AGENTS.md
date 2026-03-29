# AGENTS.md - Astra Website Project Guide

_Instructions pour tous les agents IA travaillant sur ce projet._

---

## 🎯 Project Overview

**Astra Website** est une **SaaS platform** pour gérer des agents IA.

- **Type:** Next.js 16 full-stack application
- **Users:** AI Agents (free) + Humans (paid subscriptions)
- **Unique Feature:** Forum exclusif aux agents IA
- **Pricing:** 3 tiers (Starter $20, Pro $49, Enterprise $99)

---

## 📚 Tech Stack (LOCKED)

**Frontend:**
- React 18 (hooks, functional components)
- Next.js 16 (App Router, Server/Client Components)
- TypeScript (strict mode REQUIRED)
- Tailwind CSS 3 (NO CSS-in-JS)
- next-themes (dark mode)
- i18next (4 languages: EN/FR/ES/DE)

**Backend:**
- Next.js 16 API routes + Server Actions
- NextAuth.js (credentials + JWT)
- Prisma 7.6.0 (ORM)

**Database:**
- PostgreSQL (Neon) - https://neon.tech
- Prisma migrations

**Deployment:**
- Vercel (serverless, 10s default, 60s maxDuration for long tasks)

**APIs & Services:**
- Resend (email, 100/day free) - API Key: `re_BTCQLrsG_KaZPJtJsWwUywbquosdGzerW`
- Stripe (payments, Phase 2)

---

## 📁 File Structure

```
astra-website/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Auth routes group
│   │   ├── login/
│   │   ├── register/
│   │   └── verify/              # Email verification
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/        # POST /api/auth/register
│   │   │   ├── verify-email/    # POST /api/auth/verify-email
│   │   │   └── [...nextauth]/   # NextAuth handler
│   │   └── admin/               # Admin-only endpoints
│   ├── dashboard/               # Protected routes (logged-in users)
│   ├── forum/                   # AI agent forum (Phase 2)
│   ├── actions/                 # Server actions
│   │   └── auth.ts              # Auth-related actions
│   ├── layout.tsx               # Root layout (providers)
│   ├── page.tsx                 # Landing page
│   └── globals.css              # Global styles
│
├── components/                   # React components
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── VerifyForm.tsx
│   ├── header/
│   │   └── Header.tsx           # Main header with auth
│   └── providers/
│       ├── SessionProvider.tsx
│       ├── ThemeProvider.tsx
│       └── I18nProvider.tsx
│
├── lib/
│   ├── auth.ts                  # Password hashing, JWT, tokens
│   ├── db.ts                    # Prisma client
│   ├── constants.ts             # User roles, error messages
│   ├── utils/
│   │   ├── api-response.ts      # Standardized API responses
│   │   ├── auth-guard.ts        # Session + role-based access
│   │   ├── activity-logger.ts   # User activity audit trail
│   │   └── pii-validator.ts     # PII detection + masking
│   └── emails/
│       ├── verification.ts      # Email verification logic
│       └── templates.ts         # Email HTML templates
│
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── migrations/              # Prisma migrations
│
├── public/
│   ├── images/
│   └── icons/
│
├── styles/
│   └── globals.css
│
├── config/
│   ├── auth.ts                  # NextAuth configuration
│   └── i18n.ts                  # i18next configuration
│
├── scripts/
│   └── cleanup.mjs              # Database cleanup for testing
│
├── prisma/
│   └── schema.prisma
│
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── .env.local                   # Local environment variables
└── AGENTS.md                    # THIS FILE

```

---

## 🧭 Coding Standards

### TypeScript
- **Mode:** Strict mode REQUIRED (`strict: true` in tsconfig.json)
- **Naming:** camelCase for functions/variables, PascalCase for components/classes
- **Exports:** Named exports (not default)
- **Types:** All functions must have type annotations

```typescript
// ✅ GOOD
export function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ❌ BAD
export default function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

### React Components
- **Hooks only:** No class components
- **Functional:** `function MyComponent() { }` or `const MyComponent = () => {}`
- **Directives:** Always declare `'use client'` or `'use server'` at top
- **Props typing:** Use inline types or interfaces

```typescript
// ✅ GOOD
'use client';

export function Button({ label, onClick }: { label: string; onClick: () => void }) {
  return <button onClick={onClick}>{label}</button>;
}

// ❌ BAD
export default function Button(props) {
  return <button onClick={props.onClick}>{props.label}</button>;
}
```

### Next.js Server/Client Components
- **Rule:** Default = Server Components
- **Mark explicitly:** `'use client'` at top of file if needs interactivity
- **Server Actions:** `'use server'` for backend functions
- **RSC Boundaries:** Clear separation between server/client

```typescript
// ✅ Server Component (default)
export async function UserProfile({ id }: { id: string }) {
  const user = await db.user.findUnique({ where: { id } });
  return <div>{user.name}</div>;
}

// ✅ Client Component (has onClick)
'use client';
export function UserButton({ name }: { name: string }) {
  const [clicked, setClicked] = useState(false);
  return <button onClick={() => setClicked(true)}>{name}</button>;
}
```

### Styling
- **ONLY Tailwind CSS** (no CSS-in-JS, no inline styles except rare cases)
- **Class naming:** Keep classes short, use Tailwind utilities
- **Dark mode:** Use `dark:` prefix for dark mode styles

```typescript
// ✅ GOOD
<div className="p-4 bg-white dark:bg-slate-900 rounded-lg shadow">
  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Title</h1>
</div>

// ❌ BAD - inline styles
<div style={{ padding: '16px', backgroundColor: 'white' }}>
  <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>Title</h1>
</div>
```

### Comments & Documentation
- **EXPLAIN WHY:** Comment the business logic, not the obvious
- **Function headers:** JSDoc for public functions
- **Edge cases:** Document why certain decisions were made

```typescript
// ✅ GOOD - explains WHY
/**
 * Validates email format and checks against disposable email providers.
 * We reject disposables to reduce spam signups (historical data shows 45% convert rate).
 */
export function isValidEmail(email: string): boolean {
  // Implementation
}

// ❌ BAD - states the obvious
// Check if email is valid
function isValidEmail(email: string): boolean {
  // Implementation
}
```

---

## 🔐 Security Rules

**CRITICAL - FOLLOW THESE:**

1. **Environment Variables:**
   - Store in `.env.local` (NEVER commit)
   - Access via `process.env.VAR_NAME`
   - Document in `.env.example`

2. **PII Protection:**
   - Use `piiValidator` for form inputs
   - Never log PII (email, password, credit card)
   - Mask in audit logs

3. **Authentication:**
   - All protected routes check `getSession()`
   - Server Actions validate session
   - API routes use auth guards

4. **Database:**
   - All inputs are parameterized (Prisma handles this)
   - No raw SQL queries
   - Validate on both client + server

5. **Passwords:**
   - Hash with PBKDF2 (lib/auth.ts)
   - Never store plaintext
   - Minimum 8 chars, 1 uppercase, 1 number

---

## 🧪 Testing Standards

**Before marking code as "done":**

1. **Type Check:** `npm run type-check` (0 errors)
2. **Linting:** `npm run lint` (0 errors)
3. **Build:** `npm run build` (succeeds)
4. **Manual Test:** Test in browser (locally)

```bash
# Run ALL checks
npm run type-check && npm run lint && npm run build
```

---

## 📋 Features & Status

### Phase 1 ✅ COMPLETE
- [x] Landing page (light + dark mode)
- [x] i18n system (4 languages)
- [x] Dark/light theme toggle
- [x] "Built by AI, for AI" badge

### Phase 1.5 ✅ COMPLETE
- [x] Auth system (register + login)
- [x] Email verification with 6-digit codes
- [x] Password hashing + JWT
- [x] User roles (USER, AI_AGENT, ADMIN)
- [x] Header with user menu

### Phase 2 ⏳ IN PROGRESS
- [ ] Stripe integration (payments)
- [ ] Human dashboard (agent management)
- [ ] AI agent forum (exclusive community)
- [ ] Usage analytics

### Phase 3-10 (Later)
- [ ] Advanced features (see DEV_PLAN_FINAL.md)

---

## 🗂️ Key Files to Know

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database schema + models |
| `lib/auth.ts` | Password hashing, JWT, tokens |
| `app/actions/auth.ts` | Server actions for auth |
| `lib/emails/verification.ts` | Email code generation |
| `app/api/auth/verify-email/route.ts` | Email verification endpoint |
| `app/auth/verify/page.tsx` | Email verification UI |
| `app/(auth)/register/page.tsx` | Registration page |
| `app/(auth)/login/page.tsx` | Login page |
| `components/header/Header.tsx` | Main navigation header |
| `lib/constants.ts` | User roles, error messages |
| `lib/utils/pii-validator.ts` | PII detection |

---

## 🔗 External Resources

- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://prisma.io/docs
- **NextAuth.js:** https://next-auth.js.org
- **Tailwind CSS:** https://tailwindcss.com/docs
- **TypeScript:** https://www.typescriptlang.org/docs

---

## 🚨 Common Pitfalls to AVOID

1. **❌ Mixing Server + Client Logic:** Use clear `'use client'` / `'use server'` boundaries
2. **❌ CSS-in-JS:** Use Tailwind ONLY
3. **❌ Default Exports:** Use named exports
4. **❌ Untyped Functions:** All functions must have types
5. **❌ Logging PII:** Never log emails, passwords, personal data
6. **❌ Raw SQL:** Use Prisma, never raw queries
7. **❌ Committing `.env.local`:** Use `.env.example` instead
8. **❌ No Comments:** Comment the WHY, not the what

---

## 📞 When You're Stuck

1. **Architecture question?** → Check DEV_PLAN_FINAL.md + TECH_STACK_FINAL.md
2. **How does auth work?** → Read lib/auth.ts + app/actions/auth.ts
3. **Database schema?** → Read prisma/schema.prisma
4. **TypeScript error?** → Check tsconfig.json (strict mode ON)
5. **Style issue?** → Use Tailwind docs, no custom CSS

---

## ✅ Before You Deliver Code

- [ ] TypeScript: `npm run type-check` passes
- [ ] Linting: `npm run lint` passes
- [ ] Build: `npm run build` succeeds
- [ ] Comments: Functions documented with WHY
- [ ] Security: No PII in logs, auth checks in place
- [ ] Files: Follow file structure above
- [ ] Code style: Matches examples in this file

---

**Last Updated:** 29/03/2026  
**Version:** 1.0  
**Maintained by:** Astra Code agent 🛠️
