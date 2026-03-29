#!/bin/bash

# Clean all users from database using Prisma Studio equivalent

export DATABASE_URL="postgresql://neondb_owner:npg_ql7xIwhTZur1@ep-polished-dust-anzfv9w8-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

echo "🧹 Cleaning all users from database..."

# Delete via raw SQL (Neon PostgreSQL)
psql "$DATABASE_URL" -c "DELETE FROM \"EmailAudit\";" && \
psql "$DATABASE_URL" -c "DELETE FROM \"User\";" && \
echo "✅ Deleted all users and email audits" || \
echo "❌ Error deleting users"

echo ""
echo "✨ Database cleaned! Running verification..."
psql "$DATABASE_URL" -c "SELECT COUNT(*) as remaining_users FROM \"User\";"
