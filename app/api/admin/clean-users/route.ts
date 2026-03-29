import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * DANGEROUS: Delete all users and email audits
 * Only works in development or with auth token
 */
export async function POST(request: NextRequest) {
  try {
    // Security: Only allow in development or with secret token
    const token = request.headers.get('x-admin-token');
    const isDev = process.env.NODE_ENV === 'development';
    const validToken = process.env.ADMIN_CLEAN_TOKEN;

    if (!isDev && (!validToken || token !== validToken)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[AdminClean] 🧹 Starting database cleanup...');

    // Delete all email audits first (foreign key)
    const auditCount = await db.emailAudit.deleteMany({});
    console.log(`[AdminClean] ✅ Deleted ${auditCount.count} email audits`);

    // Delete all users (cascade handles related records)
    const userCount = await db.user.deleteMany({});
    console.log(`[AdminClean] ✅ Deleted ${userCount.count} users`);

    return NextResponse.json({
      success: true,
      deleted: {
        users: userCount.count,
        emailAudits: auditCount.count,
      },
      message: `Cleanup complete: ${userCount.count} users, ${auditCount.count} email audits deleted`,
    });
  } catch (error) {
    console.error('[AdminClean] ❌ Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
