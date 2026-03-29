import { db } from '@/lib/db';
import { logger } from '@/lib/utils/logger';

export interface ActivityLogEntry {
  agentId: string;
  action: string;
  details?: Record<string, unknown> | null;
  ipAddress?: string;
}

/**
 * Log an activity for an AI agent or user
 */
export async function logActivity(entry: ActivityLogEntry): Promise<void> {
  try {
    const data: any = {
      agentId: entry.agentId,
      action: entry.action,
      ipAddress: entry.ipAddress,
    };

    if (entry.details) {
      data.details = entry.details;
    }

    await db.activityLog.create({ data });
  } catch (error) {
    logger.error(
      {
        error,
        entry,
      },
      'Failed to log activity'
    );
  }
}

/**
 * Get activity history for an agent
 */
export async function getActivityHistory(
  agentId: string,
  limit: number = 100
) {
  try {
    const logs = await db.activityLog.findMany({
      where: { agentId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return logs;
  } catch (error) {
    logger.error(
      {
        error,
        agentId,
      },
      'Failed to fetch activity history'
    );
    return [];
  }
}

/**
 * Clear old activity logs (retention policy)
 * Keep only logs from the last 90 days
 */
export async function cleanupOldActivityLogs(): Promise<void> {
  try {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const result = await db.activityLog.deleteMany({
      where: {
        createdAt: {
          lt: ninetyDaysAgo,
        },
      },
    });

    logger.info({ deletedCount: result.count }, 'Cleaned up old activity logs');
  } catch (error) {
    logger.error({ error }, 'Failed to cleanup old activity logs');
  }
}
