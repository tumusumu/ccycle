/**
 * Goals API Routes
 * GET: List all goals (optionally filter by status)
 * POST: Create a new goal
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { IMetricGoalInput, TGoalStatus, TGoalType } from '@/types/user';
import { getToday } from '@/utils/date';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found', code: 'NO_USER' },
        { status: 404 }
      );
    }

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const statusParam = searchParams.get('status');

    const where: {
      userId: string;
      status?: TGoalStatus;
    } = {
      userId: user.id,
    };

    if (statusParam && ['ACTIVE', 'ACHIEVED', 'CANCELLED'].includes(statusParam)) {
      where.status = statusParam as TGoalStatus;
    }

    const goals = await prisma.metricGoal.findMany({
      where,
      orderBy: [
        { status: 'asc' }, // ACTIVE first
        { createdAt: 'desc' },
      ],
    });

    // Get current metrics to calculate progress for each goal
    const latestMetrics = await prisma.bodyMetrics.findFirst({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
    });

    const goalsWithProgress = goals.map((goal) => {
      let currentValue: number | null = null;
      let progress = 0;

      if (latestMetrics) {
        switch (goal.goalType) {
          case 'WEIGHT':
            currentValue = latestMetrics.weight;
            break;
          case 'BODY_FAT':
            currentValue = latestMetrics.bodyFatPercentage;
            break;
          case 'MUSCLE_MASS':
            currentValue = latestMetrics.muscleMass;
            break;
        }
      }

      if (currentValue !== null) {
        const totalChange = goal.targetValue - goal.startValue;
        const actualChange = currentValue - goal.startValue;

        if (totalChange !== 0) {
          progress = Math.min(100, Math.max(0, (actualChange / totalChange) * 100));
        } else if (currentValue === goal.targetValue) {
          progress = 100;
        }
      }

      return {
        ...goal,
        currentValue,
        progress: Math.round(progress),
      };
    });

    return NextResponse.json({ goals: goalsWithProgress });
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as IMetricGoalInput;

    // Validate required fields
    if (!body.goalType || body.targetValue === undefined || body.startValue === undefined) {
      return NextResponse.json(
        { error: 'goalType, targetValue, and startValue are required' },
        { status: 400 }
      );
    }

    // Validate goalType
    if (!['WEIGHT', 'BODY_FAT', 'MUSCLE_MASS'].includes(body.goalType)) {
      return NextResponse.json(
        { error: 'Invalid goalType. Must be WEIGHT, BODY_FAT, or MUSCLE_MASS' },
        { status: 400 }
      );
    }

    // Validate values
    if (body.targetValue === body.startValue) {
      return NextResponse.json(
        { error: 'Target value must be different from start value' },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found', code: 'NO_USER' },
        { status: 404 }
      );
    }

    // Check if there's already an active goal of the same type
    const existingActiveGoal = await prisma.metricGoal.findFirst({
      where: {
        userId: user.id,
        goalType: body.goalType as TGoalType,
        status: 'ACTIVE',
      },
    });

    if (existingActiveGoal) {
      return NextResponse.json(
        { error: `An active ${body.goalType} goal already exists. Cancel it first to create a new one.` },
        { status: 400 }
      );
    }

    const goal = await prisma.metricGoal.create({
      data: {
        userId: user.id,
        goalType: body.goalType as TGoalType,
        targetValue: body.targetValue,
        startValue: body.startValue,
        startDate: getToday(),
        targetDate: body.targetDate ? new Date(body.targetDate) : null,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json(
      { error: 'Failed to create goal' },
      { status: 500 }
    );
  }
}
