#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function cleanUsers() {
  try {
    console.log('🧹 Cleaning up all users...');

    // Delete all email audits first (foreign key constraint)
    const deletedAudits = await db.emailAudit.deleteMany({});
    console.log(`✅ Deleted ${deletedAudits.count} email audits`);

    // Delete all users (cascade will handle related records)
    const deletedUsers = await db.user.deleteMany({});
    console.log(`✅ Deleted ${deletedUsers.count} users`);

    console.log('\n✨ Database cleaned! All test accounts removed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

cleanUsers();
