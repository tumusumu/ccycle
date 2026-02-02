/**
 * Username availability check API
 * GET: Check if username is available
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Username validation regex: letters and numbers only, 4-20 characters
const USERNAME_REGEX = /^[a-zA-Z0-9]{4,20}$/;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required', valid: false },
        { status: 400 }
      );
    }

    // Validate format
    if (!USERNAME_REGEX.test(username)) {
      return NextResponse.json({
        valid: false,
        error: '用户名必须由4-20个字母或数字组成',
      });
    }

    // Check if username exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json({
        valid: false,
        error: '该用户名已被使用',
        userId: existingUser.id, // Return user ID for login functionality
      });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Error checking username:', error);
    return NextResponse.json(
      { error: 'Failed to check username', valid: false },
      { status: 500 }
    );
  }
}
