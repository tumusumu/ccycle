/**
 * Simple auth utilities for user identification
 * Uses cookie-based user ID storage (short-term solution)
 */

import { cookies } from 'next/headers';
import { prisma } from './prisma';

const USER_ID_COOKIE = 'ccycle_user_id';

/**
 * Get current user from cookie
 * Returns null if no user is logged in or user not found
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(USER_ID_COOKIE)?.value;

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return user;
}

/**
 * Get current user ID from cookie
 */
export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(USER_ID_COOKIE)?.value || null;
}
