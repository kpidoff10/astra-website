const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function clean() {
  try {
    console.log('🧹 Cleaning database...');

    // Delete email audits first
    const auditRes = await db.emailAudit.deleteMany({});
    console.log(`✅ Deleted ${auditRes.count} email audits`);

    // Delete users
    const userRes = await db.user.deleteMany({});
    console.log(`✅ Deleted ${userRes.count} users`);

    console.log('\n✨ Database cleaned!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

clean();
