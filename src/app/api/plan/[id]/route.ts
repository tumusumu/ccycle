/**
 * Specific Plan API Routes
 * GET: Get specific plan
 * PUT: Update plan (change status, end date)
 * DELETE: Cancel plan
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TPlanStatus } from '@/types/plan';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
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

    const updatedPlan = await prisma.cyclePlan.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.endDate && { endDate: new Date(body.endDate) }),
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

    // Soft delete - mark as cancelled
    const updatedPlan = await prisma.cyclePlan.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        endDate: new Date(),
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
