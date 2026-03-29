import { jsonResponse } from '@/lib/utils/api-response';

/**
 * POST /api/auth/logout
 * Logs out the current user
 * Note: This is a client-side redirect in NextAuth.
 * The actual logout is handled by NextAuth's built-in signOut()
 */
export async function POST() {
  return jsonResponse(
    { message: 'Use signOut() from next-auth/react on the client' },
    200
  );
}

export async function GET() {
  return jsonResponse(
    { message: 'Use signOut() from next-auth/react on the client' },
    200
  );
}
