/**
 * Specific Plan API Routes
 * GET: Get specific plan
 * PUT: Update plan (change status, end date)
 * DELETE: Cancel plan
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { TPlanStatus } from '@/types/plan';
import { parseDate, getToday } from '@/utils/date';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
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

    const plan = await prisma.cyclePlan.findUnique({
      where: { id },
      include: {
        dailyMealPlans: {
          orderBy: { date: 'asc' },
          include: {
            intakeRecord: true,
          },
        },
        cycleSummary: true,
      },
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    // 验证所有权
    if (plan.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error fetching plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plan' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'NO_USER' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = (await request.json()) as {
      status?: TPlanStatus;
      endDate?: string;
    };

    const plan = await prisma.cyclePlan.findUnique({
      where: { id },
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    // 验证所有权
    if (plan.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const updatedPlan = await prisma.cyclePlan.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.endDate && { endDate: parseDate(body.endDate) }),
      },
    });

    return NextResponse.json(updatedPlan);
  } catch (error) {
    console.error('Error updating plan:', error);
    return NextResponse.json(
      { error: 'Failed to update plan' },
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

    const plan = await prisma.cyclePlan.findUnique({
      where: { id },
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    // 验证所有权
    if (plan.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Soft delete - mark as cancelled
    const updatedPlan = await prisma.cyclePlan.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        endDate: getToday(),
      },
    });

    return NextResponse.json(updatedPlan);
  } catch (error) {
    console.error('Error cancelling plan:', error);
    return NextResponse.json(
      { error: 'Failed to cancel plan' },
      { status: 500 }
    );
  }
}
