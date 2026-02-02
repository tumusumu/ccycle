/**
 * Today's Intake API Routes
 * GET: Get today's intake record with actual values
 * PUT: Update today's intake record with actual values
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getToday } from '@/utils/date';

interface IActualIntakeInput {
  // Breakfast
  oatmealGrams?: number;
  wholeEggs?: number;
  whiteOnlyEggs?: number;
  breakfastCompleted?: boolean;
  // Lunch
  lunchRiceGrams?: number;
  lunchMeatType?: string;
  lunchMeatGrams?: number;
  lunchCompleted?: boolean;
  // Snack
  snackRiceGrams?: number;
  snackMeatType?: string;
  snackMeatGrams?: number;
  snackCompleted?: boolean;
  // Dinner
  dinnerRiceGrams?: number;
  dinnerMeatType?: string;
  dinnerMeatGrams?: number;
  dinnerCompleted?: boolean;
  // Exercise
  strengthMinutes?: number;
  strengthCompleted?: boolean;
  cardioMinutes?: number;
  cardioCompleted?: boolean;
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found', code: 'NO_USER' },
        { status: 404 }
      );
    }

    // Get active plan
    const plan = await prisma.cyclePlan.findFirst({
      where: {
        userId: user.id,
        status: 'ACTIVE',
      },
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'No active plan found', code: 'NO_PLAN' },
        { status: 404 }
      );
    }

    const today = getToday();

    // Find today's meal plan
    const mealPlan = await prisma.dailyMealPlan.findFirst({
      where: {
        cyclePlanId: plan.id,
        date: today,
      },
      include: {
        intakeRecord: true,
      },
    });

    if (!mealPlan) {
      return NextResponse.json(
        { error: 'No meal plan found for today', code: 'NO_MEAL_PLAN' },
        { status: 404 }
      );
    }

    // Get exercise record for today
    const exerciseRecord = await prisma.exerciseRecord.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
    });

    // Build intake response from database records
    const intake = mealPlan.intakeRecord;

    return NextResponse.json({
      dailyMealPlanId: mealPlan.id,
      carbDayType: mealPlan.carbDayType,
      intake: intake ? {
        // Breakfast
        oatmealGrams: intake.actualOatmealGrams ?? 0,
        wholeEggs: intake.actualWholeEggs ?? 0,
        whiteOnlyEggs: intake.actualWhiteOnlyEggs ?? 0,
        breakfastCompleted: intake.oatmealCompleted && intake.protein1Completed,
        // Lunch
        lunchRiceGrams: intake.actualLunchRiceGrams ?? 0,
        lunchMeatType: intake.actualLunchMeatType ?? '',
        lunchMeatGrams: intake.actualLunchMeatGrams ?? 0,
        lunchCompleted: intake.riceLunchCompleted && intake.protein2Completed,
        // Snack
        snackRiceGrams: intake.actualSnackRiceGrams ?? 0,
        snackMeatType: intake.actualSnackProteinType ?? '',
        snackMeatGrams: intake.actualSnackProteinGrams ?? 0,
        snackCompleted: intake.protein3Completed,
        // Dinner
        dinnerRiceGrams: intake.actualDinnerRiceGrams ?? 0,
        dinnerMeatType: intake.actualDinnerMeatType ?? '',
        dinnerMeatGrams: intake.actualDinnerMeatGrams ?? 0,
        dinnerCompleted: intake.riceDinnerCompleted && intake.protein4Completed,
        // Exercise
        strengthMinutes: exerciseRecord?.strengthCompleted ? (intake.actualStrengthMinutes ?? 0) : 0,
        strengthCompleted: exerciseRecord?.strengthCompleted ?? false,
        cardioMinutes: exerciseRecord?.cardioSession1 || exerciseRecord?.cardioSession2
          ? (intake.actualCardioMinutes ?? exerciseRecord?.cardioMinutes ?? 0)
          : 0,
        cardioCompleted: (exerciseRecord?.cardioSession1 || exerciseRecord?.cardioSession2) ?? false,
      } : null,
    });
  } catch (error) {
    console.error('Error fetching today\'s intake:', error);
    return NextResponse.json(
      { error: 'Failed to fetch today\'s intake' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as IActualIntakeInput;

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found', code: 'NO_USER' },
        { status: 404 }
      );
    }

    // Get active plan
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

    const today = getToday();

    // Find today's meal plan
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

    // Build update data for intake record
    const intakeUpdateData: Record<string, boolean | number | string | null> = {};

    // Breakfast
    if (body.oatmealGrams !== undefined) {
      intakeUpdateData.actualOatmealGrams = body.oatmealGrams;
    }
    if (body.wholeEggs !== undefined) {
      intakeUpdateData.actualWholeEggs = body.wholeEggs;
    }
    if (body.whiteOnlyEggs !== undefined) {
      intakeUpdateData.actualWhiteOnlyEggs = body.whiteOnlyEggs;
    }
    if (body.breakfastCompleted !== undefined) {
      intakeUpdateData.oatmealCompleted = body.breakfastCompleted;
      intakeUpdateData.protein1Completed = body.breakfastCompleted;
    }

    // Lunch
    if (body.lunchRiceGrams !== undefined) {
      intakeUpdateData.actualLunchRiceGrams = body.lunchRiceGrams;
    }
    if (body.lunchMeatType !== undefined) {
      intakeUpdateData.actualLunchMeatType = body.lunchMeatType;
    }
    if (body.lunchMeatGrams !== undefined) {
      intakeUpdateData.actualLunchMeatGrams = body.lunchMeatGrams;
    }
    if (body.lunchCompleted !== undefined) {
      intakeUpdateData.riceLunchCompleted = body.lunchCompleted;
      intakeUpdateData.protein2Completed = body.lunchCompleted;
    }

    // Snack
    if (body.snackRiceGrams !== undefined) {
      intakeUpdateData.actualSnackRiceGrams = body.snackRiceGrams;
    }
    if (body.snackMeatType !== undefined) {
      intakeUpdateData.actualSnackProteinType = body.snackMeatType;
    }
    if (body.snackMeatGrams !== undefined) {
      intakeUpdateData.actualSnackProteinGrams = body.snackMeatGrams;
    }
    if (body.snackCompleted !== undefined) {
      intakeUpdateData.protein3Completed = body.snackCompleted;
    }

    // Dinner
    if (body.dinnerRiceGrams !== undefined) {
      intakeUpdateData.actualDinnerRiceGrams = body.dinnerRiceGrams;
    }
    if (body.dinnerMeatType !== undefined) {
      intakeUpdateData.actualDinnerMeatType = body.dinnerMeatType;
    }
    if (body.dinnerMeatGrams !== undefined) {
      intakeUpdateData.actualDinnerMeatGrams = body.dinnerMeatGrams;
    }
    if (body.dinnerCompleted !== undefined) {
      intakeUpdateData.riceDinnerCompleted = body.dinnerCompleted;
      intakeUpdateData.protein4Completed = body.dinnerCompleted;
    }

    // Exercise minutes (stored in intake record)
    if (body.strengthMinutes !== undefined) {
      intakeUpdateData.actualStrengthMinutes = body.strengthMinutes;
    }
    if (body.cardioMinutes !== undefined) {
      intakeUpdateData.actualCardioMinutes = body.cardioMinutes;
    }

    // Upsert intake record
    const intakeRecord = await prisma.dailyIntakeRecord.upsert({
      where: { dailyMealPlanId: mealPlan.id },
      update: intakeUpdateData,
      create: {
        dailyMealPlanId: mealPlan.id,
        ...intakeUpdateData,
      },
    });

    // Update exercise record if exercise data is provided
    if (body.strengthCompleted !== undefined || body.cardioCompleted !== undefined) {
      await prisma.exerciseRecord.upsert({
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
          ...(body.cardioCompleted !== undefined && {
            cardioSession1: body.cardioCompleted,
          }),
          ...(body.cardioMinutes !== undefined && {
            cardioMinutes: body.cardioMinutes,
          }),
        },
        create: {
          userId: user.id,
          date: today,
          strengthCompleted: body.strengthCompleted ?? false,
          cardioSession1: body.cardioCompleted ?? false,
          cardioMinutes: body.cardioMinutes,
        },
      });
    }

    return NextResponse.json({
      success: true,
      dailyMealPlanId: mealPlan.id,
      intakeRecord,
    });
  } catch (error) {
    console.error('Error updating today\'s intake:', error);
    return NextResponse.json(
      { error: 'Failed to update today\'s intake' },
      { status: 500 }
    );
  }
}
