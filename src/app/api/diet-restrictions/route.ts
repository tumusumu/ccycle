/**
 * Diet Restrictions Check-in API
 * GET: Get today's check-in status and streak count
 * PUT: Submit/update today's check-in
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getToday } from '@/utils/date';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found', code: 'NO_USER' },
        { status: 401 }
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
        { error: 'No active plan', code: 'NO_PLAN' },
        { status: 404 }
      );
    }

    const today = getToday();

    // Find today's meal plan
    const todayMealPlan = await prisma.dailyMealPlan.findFirst({
      where: {
        cyclePlanId: plan.id,
        date: today,
      },
      include: {
        intakeRecord: true,
      },
    });

    if (!todayMealPlan) {
      return NextResponse.json(
        { error: 'No meal plan for today', code: 'NO_MEAL_PLAN' },
        { status: 404 }
      );
    }

    const currentDay = todayMealPlan.dayNumber;

    // Get today's check-in status
    const todayCheck = todayMealPlan.intakeRecord
      ? {
          noFruit: todayMealPlan.intakeRecord.noFruitConfirmed,
          noSugar: todayMealPlan.intakeRecord.noSugarConfirmed,
          noWhiteFlour: todayMealPlan.intakeRecord.noWhiteFlourConfirmed,
        }
      : {
          noFruit: false,
          noSugar: false,
          noWhiteFlour: false,
        };

    // Calculate streak days (连续遵守天数)
    // Get all meal plans with intake records, ordered by day number descending
    const allMealPlans = await prisma.dailyMealPlan.findMany({
      where: {
        cyclePlanId: plan.id,
        dayNumber: {
          lte: currentDay,
          gte: 1,
        },
      },
      include: {
        intakeRecord: true,
      },
      orderBy: {
        dayNumber: 'desc',
      },
    });

    let streakDays = 0;

    // Count consecutive days where all three items are confirmed
    for (const mealPlan of allMealPlans) {
      const record = mealPlan.intakeRecord;
      if (
        record &&
        record.noFruitConfirmed &&
        record.noSugarConfirmed &&
        record.noWhiteFlourConfirmed
      ) {
        streakDays++;
      } else {
        // Break the streak if any day is not fully confirmed
        break;
      }
    }

    return NextResponse.json({
      ok: true,
      currentDay,
      remainingDays: Math.max(0, 30 - currentDay),
      today: todayCheck,
      streakDays,
      isFirstMonth: currentDay <= 30,
    });
  } catch (error) {
    console.error('Error fetching diet restrictions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch diet restrictions' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { noFruit, noSugar, noWhiteFlour } = body;

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found', code: 'NO_USER' },
        { status: 401 }
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
        { error: 'No active plan', code: 'NO_PLAN' },
        { status: 404 }
      );
    }

    const today = getToday();

    // Find today's meal plan
    const todayMealPlan = await prisma.dailyMealPlan.findFirst({
      where: {
        cyclePlanId: plan.id,
        date: today,
      },
    });

    if (!todayMealPlan) {
      return NextResponse.json(
        { error: 'No meal plan for today', code: 'NO_MEAL_PLAN' },
        { status: 404 }
      );
    }

    // Only allow check-in during the first 30 days
    if (todayMealPlan.dayNumber > 30) {
      return NextResponse.json(
        { error: 'Diet restrictions only apply to the first 30 days' },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: Record<string, boolean> = {};
    if (noFruit !== undefined) {
      updateData.noFruitConfirmed = noFruit;
    }
    if (noSugar !== undefined) {
      updateData.noSugarConfirmed = noSugar;
    }
    if (noWhiteFlour !== undefined) {
      updateData.noWhiteFlourConfirmed = noWhiteFlour;
    }

    // Upsert intake record
    const intakeRecord = await prisma.dailyIntakeRecord.upsert({
      where: { dailyMealPlanId: todayMealPlan.id },
      update: updateData,
      create: {
        dailyMealPlanId: todayMealPlan.id,
        ...updateData,
      },
    });

    return NextResponse.json({
      success: true,
      record: {
        noFruit: intakeRecord.noFruitConfirmed,
        noSugar: intakeRecord.noSugarConfirmed,
        noWhiteFlour: intakeRecord.noWhiteFlourConfirmed,
      },
    });
  } catch (error) {
    console.error('Error updating diet restrictions:', error);
    return NextResponse.json(
      { error: 'Failed to update diet restrictions' },
      { status: 500 }
    );
  }
}
