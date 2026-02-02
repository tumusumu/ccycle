/**
 * Body Metrics API Routes
 * GET: Get body metrics history (with date range query params)
 * POST: Record new body metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { IBodyMetricsInput } from '@/types/user';
import { getToday, parseDate } from '@/utils/date';

export async function GET(request: NextRequest) {
  try {
    const user = await prisma.user.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse query params for date range
    const searchParams = request.nextUrl.searchParams;
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    const limit = searchParams.get('limit');

    const where: {
      userId: string;
      date?: {
        gte?: Date;
        lte?: Date;
      };
    } = {
      userId: user.id,
    };

    if (startDateStr || endDateStr) {
      where.date = {};
      if (startDateStr) {
        where.date.gte = parseDate(startDateStr);
      }
      if (endDateStr) {
        where.date.lte = parseDate(endDateStr);
      }
    }

    const metrics = await prisma.bodyMetrics.findMany({
      where,
      orderBy: { date: 'asc' },
      take: limit ? parseInt(limit) : undefined,
    });

    // Calculate summary stats
    let summary = null;
    if (metrics.length > 0) {
      const first = metrics[0];
      const last = metrics[metrics.length - 1];

      summary = {
        startWeight: first.weight,
        currentWeight: last.weight,
        weightChange: last.weight - first.weight,
        startBodyFat: first.bodyFatPercentage,
        currentBodyFat: last.bodyFatPercentage,
        bodyFatChange:
          first.bodyFatPercentage && last.bodyFatPercentage
            ? last.bodyFatPercentage - first.bodyFatPercentage
            : null,
        totalRecords: metrics.length,
      };
    }

    return NextResponse.json({
      metrics,
      summary,
    });
  } catch (error) {
    console.error('Error fetching body metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch body metrics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as IBodyMetricsInput;

    if (!body.weight) {
      return NextResponse.json(
        { error: 'Weight is required' },
        { status: 400 }
      );
    }

    // Validate values
    if (body.weight <= 0 || body.weight > 300) {
      return NextResponse.json(
        { error: 'Weight must be between 0 and 300 kg' },
        { status: 400 }
      );
    }

    if (
      body.bodyFatPercentage !== undefined &&
      (body.bodyFatPercentage < 0 || body.bodyFatPercentage > 1)
    ) {
      return NextResponse.json(
        { error: 'Body fat percentage must be between 0 and 1' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const date = body.date ? new Date(body.date) : getToday();

    // Upsert body metrics for the date
    const metrics = await prisma.bodyMetrics.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: date,
        },
      },
      update: {
        weight: body.weight,
        bodyFatPercentage: body.bodyFatPercentage,
      },
      create: {
        userId: user.id,
        date: date,
        weight: body.weight,
        bodyFatPercentage: body.bodyFatPercentage,
      },
    });

    // Also update user's current weight/body fat
    await prisma.user.update({
      where: { id: user.id },
      data: {
        weight: body.weight,
        ...(body.bodyFatPercentage !== undefined && {
          bodyFatPercentage: body.bodyFatPercentage,
        }),
      },
    });

    return NextResponse.json(metrics, { status: 201 });
  } catch (error) {
    console.error('Error recording body metrics:', error);
    return NextResponse.json(
      { error: 'Failed to record body metrics' },
      { status: 500 }
    );
  }
}
