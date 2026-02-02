/**
 * Today's Plan API Route
 * GET: Get today's meal plan and exercise suggestions
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateExercisePlan } from '@/utils/exercise';
import { formatDate, getToday } from '@/utils/date';
import { TCarbDayType } from '@/types/plan';

export async function GET() {
  try {
    const user = await prisma.user.findFirst({
      orderBy: { createdAt: 'desc' },
    });

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

    // Get today's date (normalized to start of day)
    const today = getToday();
    const todayStr = formatDate(today);

    // Check if plan hasn't started yet
    if (plan.startDate > today) {
      return NextResponse.json(
        {
          error: 'Plan has not started yet',
          code: 'PLAN_NOT_STARTED',
          startDate: formatDate(plan.startDate),
        },
        { status: 200 }
      );
    }

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

    // Generate exercise plan based on carb day type
    const exercisePlan = generateExercisePlan(mealPlan.carbDayType as TCarbDayType);

    return NextResponse.json({
      date: todayStr,
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
    console.error('Error fetching today\'s plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch today\'s plan' },
      { status: 500 }
    );
  }
}
