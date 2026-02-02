/**
 * Cycle Plan API Routes
 * GET: Get all plans for user
 * POST: Create new cycle plan (auto-generates daily meal plans)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ICyclePlanInput } from '@/types/plan';
import { TGender } from '@/types/user';
import { getCarbDayType } from '@/utils/carbon-cycle';
import { generateMealPlanData } from '@/utils/nutrition';
import { addDays } from '@/utils/date';

const DEFAULT_CYCLE_DAYS = 6; // One full 112113 cycle
const CYCLE_LENGTH = 6; // 112113 pattern length

export async function GET() {
  try {
    const user = await prisma.user.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please complete onboarding first.' },
        { status: 404 }
      );
    }

    const plans = await prisma.cyclePlan.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        cycleSummary: true,
      },
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ICyclePlanInput;

    // Validate required fields
    if (!body.startDate) {
      return NextResponse.json(
        { error: 'Missing required field: startDate' },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please complete onboarding first.' },
        { status: 404 }
      );
    }

    // Cancel any existing active plans
    await prisma.cyclePlan.updateMany({
      where: {
        userId: user.id,
        status: 'ACTIVE',
      },
      data: {
        status: 'CANCELLED',
        endDate: new Date(),
      },
    });

    const startDate = new Date(body.startDate);

    // Validate cycle days (must be multiple of 6, at least 6)
    let cycleDays = body.cycleDays ?? DEFAULT_CYCLE_DAYS;
    if (cycleDays < CYCLE_LENGTH) {
      cycleDays = DEFAULT_CYCLE_DAYS;
    }
    // Round down to nearest multiple of 6
    cycleDays = Math.floor(cycleDays / CYCLE_LENGTH) * CYCLE_LENGTH;

    // Create the cycle plan (using fixed 112113 pattern)
    const plan = await prisma.cyclePlan.create({
      data: {
        userId: user.id,
        startDate: startDate,
        status: 'ACTIVE',
      },
    });

    // Generate daily meal plans for the specified period
    // Protein sources are randomly assigned per meal
    const dailyMealPlansData = [];

    for (let i = 0; i < cycleDays; i++) {
      const date = addDays(startDate, i);
      const dayNumber = i + 1;
      const carbDayType = getCarbDayType(dayNumber);

      const mealData = generateMealPlanData(
        user.weight,
        user.bodyFatPercentage,
        user.gender as TGender,
        carbDayType
      );

      dailyMealPlansData.push({
        cyclePlanId: plan.id,
        date: date,
        dayNumber: dayNumber,
        carbDayType: carbDayType,
        oatmealGrams: mealData.oatmealGrams,
        riceGramsLunch: mealData.riceGramsLunch,
        riceGramsDinner: mealData.riceGramsDinner,
        proteinGramsMeal1: mealData.proteinGramsMeal1,
        proteinSourceMeal1: mealData.proteinSourceMeal1,
        proteinGramsMeal2: mealData.proteinGramsMeal2,
        proteinSourceMeal2: mealData.proteinSourceMeal2,
        proteinGramsMeal3: mealData.proteinGramsMeal3,
        proteinSourceMeal3: mealData.proteinSourceMeal3,
        proteinGramsMeal4: mealData.proteinGramsMeal4,
        proteinSourceMeal4: mealData.proteinSourceMeal4,
        oliveoilMl: mealData.oliveoilMl,
        allowWholeEgg: mealData.allowWholeEgg,
        waterLiters: mealData.waterLiters,
      });
    }

    // Batch create all daily meal plans
    await prisma.dailyMealPlan.createMany({
      data: dailyMealPlansData,
    });

    // Record initial body metrics
    await prisma.bodyMetrics.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: startDate,
        },
      },
      update: {
        weight: user.weight,
        bodyFatPercentage: user.bodyFatPercentage,
      },
      create: {
        userId: user.id,
        date: startDate,
        weight: user.weight,
        bodyFatPercentage: user.bodyFatPercentage,
      },
    });

    // Fetch the created plan with daily meal plans for calendar display
    const planWithMeals = await prisma.cyclePlan.findUnique({
      where: { id: plan.id },
      include: {
        dailyMealPlans: {
          orderBy: { date: 'asc' },
          select: {
            id: true,
            date: true,
            dayNumber: true,
            carbDayType: true,
          },
        },
      },
    });

    return NextResponse.json(planWithMeals, { status: 201 });
  } catch (error) {
    console.error('Error creating plan:', error);
    return NextResponse.json(
      { error: 'Failed to create plan' },
      { status: 500 }
    );
  }
}
