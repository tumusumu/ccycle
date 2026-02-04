/**
 * Logout API Route
 * POST: Clear user session and cookies
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();

    // Clear both user ID cookies
    cookieStore.delete('ccycle_user_id');          // httpOnly cookie
    cookieStore.delete('ccycle_user_id_client');   // client-readable cookie

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}
