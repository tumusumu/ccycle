/**
 * Today's Exercise API Routes
 * GET: Get today's exercise record and recommendations
 * PUT: Update today's exercise record
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateExercisePlan, getExerciseCompletionStatus } from '@/utils/exercise';
import { getToday } from '@/utils/date';
import { TCarbDayType } from '@/types/plan';
import { IExerciseRecordInput } from '@/types/exercise';

export async function GET() {
  try {
    const user = await prisma.user.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const today = getToday();

    // Get today's meal plan to determine carb day type
    const plan = await prisma.cyclePlan.findFirst({
      where: {
        userId: user.id,
        status: 'ACTIVE',
      },
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'No active plan found' },
        { status: 404 }
      );
    }

    const mealPlan = await prisma.dailyMealPlan.findFirst({
      where: {
        cyclePlanId: plan.id,
        date: today,
      },
    });

    if (!mealPlan) {
      return NextResponse.json(
        { error: 'No meal plan found for today' },
        { status: 404 }
      );
    }

    // Get or create exercise record
    const exerciseRecord = await prisma.exerciseRecord.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
    });

    // Generate exercise plan
    const exercisePlan = generateExercisePlan(mealPlan.carbDayType as TCarbDayType);
    const completionStatus = getExerciseCompletionStatus(exerciseRecord, exercisePlan);

    return NextResponse.json({
      date: today.toISOString().split('T')[0],
      carbDayType: mealPlan.carbDayType,
      exercisePlan,
      exerciseRecord,
      completionStatus,
    });
  } catch (error) {
    console.error('Error fetching today\'s exercise:', error);
    return NextResponse.json(
      { error: 'Failed to fetch today\'s exercise' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as IExerciseRecordInput;

    const user = await prisma.user.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const today = getToday();

    // Upsert exercise record
    const record = await prisma.exerciseRecord.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
      update: {
        ...(body.strengthCompleted !== undefined && {
          strengthCompleted: body.strengthCompleted,
        }),
        ...(body.cardioSession1 !== undefined && {
          cardioSession1: body.cardioSession1,
        }),
        ...(body.cardioSession2 !== undefined && {
          cardioSession2: body.cardioSession2,
        }),
        ...(body.cardioMinutes !== undefined && {
          cardioMinutes: body.cardioMinutes,
        }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
      create: {
        userId: user.id,
        date: today,
        strengthCompleted: body.strengthCompleted ?? false,
        cardioSession1: body.cardioSession1 ?? false,
        cardioSession2: body.cardioSession2 ?? false,
        cardioMinutes: body.cardioMinutes,
        notes: body.notes,
      },
    });

    // Get exercise plan for completion status
    const plan = await prisma.cyclePlan.findFirst({
      where: {
        userId: user.id,
        status: 'ACTIVE',
      },
    });

    let completionStatus = null;
    if (plan) {
      const mealPlan = await prisma.dailyMealPlan.findFirst({
        where: {
          cyclePlanId: plan.id,
          date: today,
        },
      });

      if (mealPlan) {
        const exercisePlan = generateExercisePlan(mealPlan.carbDayType as TCarbDayType);
        completionStatus = getExerciseCompletionStatus(record, exercisePlan);
      }
    }

    return NextResponse.json({
      exerciseRecord: record,
      completionStatus,
    });
  } catch (error) {
    console.error('Error updating exercise record:', error);
    return NextResponse.json(
      { error: 'Failed to update exercise record' },
      { status: 500 }
    );
  }
}
