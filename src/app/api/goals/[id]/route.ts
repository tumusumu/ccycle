/**
 * Individual Goal API Routes
 * GET: Get a single goal by ID
 * PATCH: Update a goal (status, targetValue, targetDate)
 * DELETE: Delete a goal
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { IMetricGoalUpdate, TGoalStatus } from '@/types/user';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'NO_USER' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const goal = await prisma.metricGoal.findUnique({
      where: { id },
    });

    if (!goal) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }

    // 验证所有权
    if (goal.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get current value for progress calculation
    const latestMetrics = await prisma.bodyMetrics.findFirst({
      where: { userId: goal.userId },
      orderBy: { date: 'desc' },
    });

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

    return NextResponse.json({
      ...goal,
      currentValue,
      progress: Math.round(progress),
    });
  } catch (error) {
    console.error('Error fetching goal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goal' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'NO_USER' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = (await request.json()) as IMetricGoalUpdate;

    const existingGoal = await prisma.metricGoal.findUnique({
      where: { id },
    });

    if (!existingGoal) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }

    // 验证所有权
    if (existingGoal.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Build update data
    const updateData: {
      targetValue?: number;
      targetDate?: Date | null;
      status?: TGoalStatus;
      achievedAt?: Date | null;
    } = {};

    if (body.targetValue !== undefined) {
      if (body.targetValue === existingGoal.startValue) {
        return NextResponse.json(
          { error: 'Target value must be different from start value' },
          { status: 400 }
        );
      }
      updateData.targetValue = body.targetValue;
    }

    if (body.targetDate !== undefined) {
      updateData.targetDate = body.targetDate ? new Date(body.targetDate) : null;
    }

    if (body.status !== undefined) {
      if (!['ACTIVE', 'ACHIEVED', 'CANCELLED'].includes(body.status)) {
        return NextResponse.json(
          { error: 'Invalid status. Must be ACTIVE, ACHIEVED, or CANCELLED' },
          { status: 400 }
        );
      }
      updateData.status = body.status as TGoalStatus;

      // Set achievedAt timestamp when marking as achieved
      if (body.status === 'ACHIEVED') {
        updateData.achievedAt = new Date();
      } else {
        updateData.achievedAt = null;
      }
    }

    const goal = await prisma.metricGoal.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(goal);
  } catch (error) {
    console.error('Error updating goal:', error);
    return NextResponse.json(
      { error: 'Failed to update goal' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'NO_USER' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const existingGoal = await prisma.metricGoal.findUnique({
      where: { id },
    });

    if (!existingGoal) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }

    // 验证所有权
    if (existingGoal.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    await prisma.metricGoal.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting goal:', error);
    return NextResponse.json(
      { error: 'Failed to delete goal' },
      { status: 500 }
    );
  }
}
