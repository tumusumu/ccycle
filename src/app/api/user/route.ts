/**
 * User API Routes
 * GET: Get current user profile
 * POST: Create new user profile
 * PUT: Update user profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { IUserProfileInput, IUserProfileUpdate } from '@/types/user';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found', code: 'NO_USER' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// Username validation regex: letters and numbers only, 4-20 characters
const USERNAME_REGEX = /^[a-zA-Z0-9]{4,20}$/;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as IUserProfileInput;

    // Validate required fields
    if (!body.username || !body.birthYear || !body.gender || !body.weight || body.bodyFatPercentage === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: username, birthYear, gender, weight, bodyFatPercentage' },
        { status: 400 }
      );
    }

    // Validate username format
    if (!USERNAME_REGEX.test(body.username)) {
      return NextResponse.json(
        { error: '用户名必须由4-20个字母或数字组成' },
        { status: 400 }
      );
    }

    // Check if username is already taken
    const existingUser = await prisma.user.findUnique({
      where: { username: body.username },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: '该用户名已被使用' },
        { status: 409 }
      );
    }

    // Validate values
    if (body.weight < 40 || body.weight > 150) {
      return NextResponse.json(
        { error: '体重需在40-150kg之间' },
        { status: 400 }
      );
    }

    if (body.bodyFatPercentage < 0.05 || body.bodyFatPercentage > 0.45) {
      return NextResponse.json(
        { error: '体脂率需在5-45%之间' },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: {
        username: body.username,
        birthYear: body.birthYear,
        gender: body.gender,
        height: body.height,
        weight: body.weight,
        bodyFatPercentage: body.bodyFatPercentage,
        goalType: body.goalType ?? 'fat_loss',
      },
    });

    // Set user ID cookie for authentication
    const response = NextResponse.json(user, { status: 201 });
    response.cookies.set('ccycle_user_id', user.id, {
      path: '/',
      maxAge: 365 * 24 * 60 * 60, // 1 year
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as IUserProfileUpdate;

    // Find existing user
    const existingUser = await getCurrentUser();

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found', code: 'NO_USER' },
        { status: 404 }
      );
    }

    // Validate values if provided
    if (body.height !== undefined && (body.height <= 0 || body.height > 300)) {
      return NextResponse.json(
        { error: 'Height must be between 0 and 300 cm' },
        { status: 400 }
      );
    }

    if (body.weight !== undefined && (body.weight <= 0 || body.weight > 300)) {
      return NextResponse.json(
        { error: 'Weight must be between 0 and 300 kg' },
        { status: 400 }
      );
    }

    if (
      body.bodyFatPercentage !== undefined &&
      (body.bodyFatPercentage < 0 || body.bodyFatPercentage > 1)
    ) {
      return NextResponse.json(
        { error: 'Body fat percentage must be between 0 and 1' },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        ...(body.gender && { gender: body.gender }),
        ...(body.height !== undefined && { height: body.height }),
        ...(body.weight && { weight: body.weight }),
        ...(body.bodyFatPercentage !== undefined && {
          bodyFatPercentage: body.bodyFatPercentage,
        }),
        ...(body.goalType !== undefined && { goalType: body.goalType }),
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
