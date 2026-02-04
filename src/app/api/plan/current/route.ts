/**
 * Current Plan API Route
 * GET: Get current active plan with progress
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getDayNumberInCycle, getPositionInCycle } from '@/utils/carbon-cycle';
import { getToday } from '@/utils/date';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found', code: 'NO_USER' },
        { status: 404 }
      );
    }

    const plan = await prisma.cyclePlan.findFirst({
      where: {
        userId: user.id,
        status: 'ACTIVE',
      },
      include: {
        dailyMealPlans: {
          orderBy: { date: 'asc' },
          include: {
            intakeRecord: true, // 包含每天的摄入记录
          },
        },
      },
    });

    if (!plan) {
      return NextResponse.json({
        ok: false,
        code: 'NO_PLAN',
      });
    }

    const today = getToday();
    const totalDaysElapsed = getDayNumberInCycle(plan.startDate, today);
    const currentDay = getPositionInCycle(totalDaysElapsed);
    const totalDays = plan.dailyMealPlans.length;

    // Get today's meal plan
    const todaysMealPlan = plan.dailyMealPlans.find(
      (mp) => mp.date.toISOString().split('T')[0] === today.toISOString().split('T')[0]
    );

    // Get intake record for today if exists
    let intakeRecord = null;
    if (todaysMealPlan) {
      intakeRecord = await prisma.dailyIntakeRecord.findUnique({
        where: { dailyMealPlanId: todaysMealPlan.id },
      });
    }

    // Calculate completion percentage
    const completedDays = await prisma.dailyIntakeRecord.count({
      where: {
        dailyMealPlan: {
          cyclePlanId: plan.id,
        },
        followedPlan: true,
      },
    });

    const completionPercentage =
      totalDaysElapsed > 0
        ? Math.round((completedDays / Math.min(totalDaysElapsed, totalDays)) * 100)
        : 0;

    return NextResponse.json({
      ...plan,
      currentDay,
      totalDaysElapsed,
      totalDays,
      completionPercentage,
      todaysMealPlan: todaysMealPlan
        ? {
            ...todaysMealPlan,
            intakeRecord,
          }
        : null,
    });
  } catch (error) {
    console.error('Error fetching current plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch current plan' },
      { status: 500 }
    );
  }
}
