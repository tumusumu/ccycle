/**
 * Intake Record API Routes
 * POST: Create or update daily intake record
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TIntakeItemKey, IMarkDayComplete } from '@/types/intake';

interface IntakeRecordData {
  dailyMealPlanId: string;
  items?: {
    key: TIntakeItemKey;
    completed: boolean;
  }[];
  markComplete?: IMarkDayComplete;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as IntakeRecordData;

    if (!body.dailyMealPlanId) {
      return NextResponse.json(
        { error: 'Missing dailyMealPlanId' },
        { status: 400 }
      );
    }

    // Verify the meal plan exists
    const mealPlan = await prisma.dailyMealPlan.findUnique({
      where: { id: body.dailyMealPlanId },
    });

    if (!mealPlan) {
      return NextResponse.json(
        { error: 'Meal plan not found' },
        { status: 404 }
      );
    }

    // Build update data from items
    const updateData: Record<string, boolean | string> = {};

    if (body.items) {
      for (const item of body.items) {
        updateData[item.key] = item.completed;
      }
    }

    if (body.markComplete) {
      updateData.followedPlan = body.markComplete.followedPlan;
      if (body.markComplete.notes) {
        updateData.notes = body.markComplete.notes;
      }
    }

    // Upsert the intake record
    const record = await prisma.dailyIntakeRecord.upsert({
      where: { dailyMealPlanId: body.dailyMealPlanId },
      update: updateData,
      create: {
        dailyMealPlanId: body.dailyMealPlanId,
        ...updateData,
      },
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error('Error creating/updating intake record:', error);
    return NextResponse.json(
      { error: 'Failed to update intake record' },
      { status: 500 }
    );
  }
}
