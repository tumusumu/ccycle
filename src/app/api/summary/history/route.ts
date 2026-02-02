/**
 * Summary History API Route
 * GET: Get all historical cycle summaries
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

    const summaries = await prisma.cycleSummary.findMany({
      where: {
        cyclePlan: {
          userId: user.id,
        },
      },
      include: {
        cyclePlan: {
          select: {
            startDate: true,
            endDate: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(summaries);
  } catch (error) {
    console.error('Error fetching summary history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch summary history' },
      { status: 500 }
    );
  }
}
