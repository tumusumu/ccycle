/**
 * Specific Date Plan API Route
 * GET: Get meal plan for specific date
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { generateExercisePlan } from '@/utils/exercise';
import { parseDate } from '@/utils/date';
import { TCarbDayType } from '@/types/plan';

interface RouteParams {
  params: Promise<{
    date: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { date: dateStr } = await params;

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

    // Parse date
    const date = parseDate(dateStr);

    // Find meal plan for the date
    const mealPlan = await prisma.dailyMealPlan.findFirst({
      where: {
        cyclePlanId: plan.id,
        date: date,
      },
      include: {
        intakeRecord: true,
      },
    });

    if (!mealPlan) {
      return NextResponse.json(
        { error: 'No meal plan found for this date' },
        { status: 404 }
      );
    }

    // Get exercise record
    const exerciseRecord = await prisma.exerciseRecord.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: date,
        },
      },
    });

    // Generate exercise plan
    const exercisePlan = generateExercisePlan(mealPlan.carbDayType as TCarbDayType);

    return NextResponse.json({
      date: dateStr,
      dayNumber: mealPlan.dayNumber,
      carbDayType: mealPlan.carbDayType,
      mealPlan: {
        id: mealPlan.id,
        oatmealGrams: mealPlan.oatmealGrams,
        riceGramsLunch: mealPlan.riceGramsLunch,
        riceGramsDinner: mealPlan.riceGramsDinner,
        proteinGramsMeal1: mealPlan.proteinGramsMeal1,
        proteinSourceMeal1: mealPlan.proteinSourceMeal1,
        proteinGramsMeal2: mealPlan.proteinGramsMeal2,
        proteinSourceMeal2: mealPlan.proteinSourceMeal2,
        proteinGramsMeal3: mealPlan.proteinGramsMeal3,
        proteinSourceMeal3: mealPlan.proteinSourceMeal3,
        proteinGramsMeal4: mealPlan.proteinGramsMeal4,
        proteinSourceMeal4: mealPlan.proteinSourceMeal4,
        oliveoilMl: mealPlan.oliveoilMl,
        allowWholeEgg: mealPlan.allowWholeEgg,
        waterLiters: mealPlan.waterLiters,
        intakeRecord: mealPlan.intakeRecord,
      },
      exercisePlan,
      exerciseRecord,
    });
  } catch (error) {
    console.error('Error fetching plan for date:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plan for date' },
      { status: 500 }
    );
  }
}
