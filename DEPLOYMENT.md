# Deployment Guide

## Vercel Deployment

### 1. Environment Variables

Set these in Vercel project settings → Environment Variables:

```
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
JWT_SECRET=<generate: openssl rand -base64 32>
ENCRYPTION_KEY=<generate: openssl rand -base64 32>
```

### 2. Database Setup

1. **Create PostgreSQL database** (Neon, AWS RDS, etc.)
2. **Set DATABASE_URL** in environment variables
3. **Run migrations**: 
   - Local: `npx prisma migrate deploy`
   - Or Vercel will auto-run during build

### 3. Generate Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate JWT_SECRET
openssl rand -base64 32

# Generate ENCRYPTION_KEY
openssl rand -base64 32
```

### 4. Deploy

```bash
git push origin main
# Vercel auto-deploys from GitHub
```

## Local Development

```bash
# Copy .env.example to .env.local
cp .env.example .env.local

# Edit .env.local with your local values
nano .env.local

# Install & run
npm install
npm run dev
```

## Security Checklist

- [ ] JWT_SECRET set (random 32+ chars)
- [ ] ENCRYPTION_KEY set (random 32+ chars)
- [ ] NEXTAUTH_SECRET set (random 32+ chars)
- [ ] DATABASE_URL configured
- [ ] HTTPS enabled (Vercel default)
- [ ] Rate limiting active (5 attempts/15min on auth)
- [ ] PII encryption enabled
- [ ] PBKDF2 password hashing (100k iterations MVP, 600k+ production)

## Troubleshooting

### Internal Server Error on /api/auth/register

**Causes:**
1. Missing `JWT_SECRET` or `ENCRYPTION_KEY` in environment
2. Missing `DATABASE_URL`
3. Database not accessible

**Fix:** Verify all env vars are set in Vercel dashboard

### Database Connection Error

```bash
# Test connection locally
npx prisma db push

# Check DATABASE_URL format
# Should be: postgresql://user:password@host:port/database
```

### Build Fails

```bash
# Ensure node_modules are clean
npm ci

# Generate Prisma client
npx prisma generate

# Build
npm run build
```

## Production Configuration

### Database

Use a managed PostgreSQL service:
- **Neon** (recommended, free tier available)
- **Supabase** (PostgreSQL + Auth)
- **AWS RDS**
- **DigitalOcean**

### Secrets

- Store in Vercel environment variables (encrypted)
- Rotate secrets every 90 days
- Never commit `.env` to Git

### Monitoring

- Enable Vercel Analytics
- Monitor database connections
- Set up error tracking (Sentry, etc.)

### Performance

- Enable caching
- Optimize images
- Monitor build times

## Upgrade Path

1. **MVP (Current)**
   - PBKDF2: 100k iterations (~1-2 sec registration)
   - Database: PostgreSQL

2. **Beta (Next)**
   - PBKDF2: 300k iterations with worker threads
   - Add email verification
   - Add password reset flow

3. **Production**
   - PBKDF2: 600k iterations
   - Add rate limiting per user
   - Add 2FA
   - Add audit logging
