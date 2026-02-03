/**
 * Specific Intake Record API Routes
 * GET: Get intake record for a daily meal plan
 * PUT: Update intake record (check off items)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { TIntakeItemKey, IMarkDayComplete } from '@/types/intake';

interface RouteParams {
  params: Promise<{
    dailyMealPlanId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'NO_USER' },
        { status: 401 }
      );
    }

    const { dailyMealPlanId } = await params;

    // 先验证 mealPlan 的所有权
    const mealPlan = await prisma.dailyMealPlan.findUnique({
      where: { id: dailyMealPlanId },
      include: { cyclePlan: true },
    });

    if (!mealPlan) {
      return NextResponse.json(
        { error: 'Meal plan not found' },
        { status: 404 }
      );
    }

    if (mealPlan.cyclePlan.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const record = await prisma.dailyIntakeRecord.findUnique({
      where: { dailyMealPlanId },
      include: {
        dailyMealPlan: true,
      },
    });

    if (!record) {
      // Return empty record structure if none exists
      return NextResponse.json({
        dailyMealPlanId,
        oatmealCompleted: false,
        riceLunchCompleted: false,
        riceDinnerCompleted: false,
        protein1Completed: false,
        protein2Completed: false,
        protein3Completed: false,
        protein4Completed: false,
        waterCompleted: false,
        followedPlan: true,
        notes: null,
      });
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error('Error fetching intake record:', error);
    return NextResponse.json(
      { error: 'Failed to fetch intake record' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'NO_USER' },
        { status: 401 }
      );
    }

    const { dailyMealPlanId } = await params;
    const body = (await request.json()) as {
      itemKey?: TIntakeItemKey;
      completed?: boolean;
      markComplete?: IMarkDayComplete;
    };

    // Verify the meal plan exists and check ownership
    const mealPlan = await prisma.dailyMealPlan.findUnique({
      where: { id: dailyMealPlanId },
      include: { cyclePlan: true },
    });

    if (!mealPlan) {
      return NextResponse.json(
        { error: 'Meal plan not found' },
        { status: 404 }
      );
    }

    // 验证所有权
    if (mealPlan.cyclePlan.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Build update data
    const updateData: Record<string, boolean | string | null> = {};

    if (body.itemKey && body.completed !== undefined) {
      updateData[body.itemKey] = body.completed;
    }

    if (body.markComplete) {
      updateData.followedPlan = body.markComplete.followedPlan;
      if (body.markComplete.notes !== undefined) {
        updateData.notes = body.markComplete.notes ?? null;
      }
    }

    // Upsert the record
    const record = await prisma.dailyIntakeRecord.upsert({
      where: { dailyMealPlanId },
      update: updateData,
      create: {
        dailyMealPlanId,
        ...updateData,
      },
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error('Error updating intake record:', error);
    return NextResponse.json(
      { error: 'Failed to update intake record' },
      { status: 500 }
    );
  }
}
