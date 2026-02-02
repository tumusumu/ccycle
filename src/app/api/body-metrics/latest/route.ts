/**
 * Latest Body Metrics API Route
 * GET: Get latest body metrics record
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
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

    const metrics = await prisma.bodyMetrics.findFirst({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
    });

    if (!metrics) {
      // Return user's current weight/body fat if no metrics recorded
      return NextResponse.json({
        userId: user.id,
        weight: user.weight,
        bodyFatPercentage: user.bodyFatPercentage,
        date: user.createdAt,
      });
    }

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching latest body metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch latest body metrics' },
      { status: 500 }
    );
  }
}
