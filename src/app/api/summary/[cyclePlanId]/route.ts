/**
 * Cycle Summary API Routes
 * GET: Get summary for a cycle
 * POST: Generate summary for a cycle (called when cycle ends)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{
    cyclePlanId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { cyclePlanId } = await params;

    const summary = await prisma.cycleSummary.findUnique({
      where: { cyclePlanId },
      include: {
        cyclePlan: true,
      },
    });

    if (!summary) {
      return NextResponse.json(
        { error: 'Summary not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch summary' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { cyclePlanId } = await params;
    const body = (await request.json()) as {
      notes?: string;
    };

    // Get the cycle plan with all daily meal plans and intake records
    const plan = await prisma.cyclePlan.findUnique({
      where: { id: cyclePlanId },
      include: {
        dailyMealPlans: {
          include: {
            intakeRecord: true,
          },
          orderBy: { date: 'asc' },
        },
        user: true,
      },
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    // Calculate summary statistics
    const totalDays = plan.dailyMealPlans.length;
    const daysWithRecords = plan.dailyMealPlans.filter(
      (mp) => mp.intakeRecord !== null
    );

    const daysFollowed = daysWithRecords.filter(
      (mp) => mp.intakeRecord?.followedPlan
    ).length;

    const daysNotFollowed = daysWithRecords.filter(
      (mp) => !mp.intakeRecord?.followedPlan
    ).length;

    const notFollowedDates = daysWithRecords
      .filter((mp) => !mp.intakeRecord?.followedPlan)
      .map((mp) => mp.date);

    // Get body metrics for start and end
    const startMetrics = await prisma.bodyMetrics.findFirst({
      where: {
        userId: plan.userId,
        date: {
          gte: plan.startDate,
        },
      },
      orderBy: { date: 'asc' },
    });

    const endMetrics = await prisma.bodyMetrics.findFirst({
      where: {
        userId: plan.userId,
      },
      orderBy: { date: 'desc' },
    });

    // Create or update summary
    const summary = await prisma.cycleSummary.upsert({
      where: { cyclePlanId },
      update: {
        totalDays,
        daysFollowed,
        daysNotFollowed,
        startWeight: startMetrics?.weight ?? plan.user.weight,
        endWeight: endMetrics?.weight,
        startBodyFat: startMetrics?.bodyFatPercentage,
        endBodyFat: endMetrics?.bodyFatPercentage,
        notFollowedDates,
        notes: body.notes,
      },
      create: {
        cyclePlanId,
        totalDays,
        daysFollowed,
        daysNotFollowed,
        startWeight: startMetrics?.weight ?? plan.user.weight,
        endWeight: endMetrics?.weight,
        startBodyFat: startMetrics?.bodyFatPercentage,
        endBodyFat: endMetrics?.bodyFatPercentage,
        notFollowedDates,
        notes: body.notes,
      },
    });

    return NextResponse.json(summary, { status: 201 });
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}
