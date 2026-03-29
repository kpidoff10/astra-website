import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { USER_ROLES } from '@/lib/constants';

/**
 * Get the current session from NextAuth
 */
export async function getCurrentSession() {
  const session = await getServerSession(authOptions);
  return session;
}

/**
 * Require authentication - returns session or throws
 */
export async function requireAuth() {
  const session = await getCurrentSession();

  if (!session || !session.user) {
    throw new Error('UNAUTHORIZED');
  }

  return session;
}

/**
 * Require a specific role
 */
export async function requireRole(
  role: (typeof USER_ROLES)[keyof typeof USER_ROLES]
) {
  const session = await requireAuth();

  if ((session.user as Record<string, unknown>).role !== role) {
    throw new Error('FORBIDDEN');
  }

  return session;
}

/**
 * Require admin access
 */
export async function requireAdmin() {
  return requireRole(USER_ROLES.ADMIN);
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getCurrentSession();
  return !!session?.user;
}

/**
 * Check if user has a specific role
 */
export async function hasRole(
  role: (typeof USER_ROLES)[keyof typeof USER_ROLES]
): Promise<boolean> {
  const session = await getCurrentSession();
  return (session?.user as Record<string, unknown>)?.role === role;
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole(USER_ROLES.ADMIN);
}

/**
 * Get current user ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getCurrentSession();
  const id = (session?.user as Record<string, unknown>)?.id;
  return typeof id === 'string' ? id : null;
}
