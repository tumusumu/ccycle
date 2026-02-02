/**
 * Body Metrics Trends API
 * GET: Get trends and analytics for body metrics
 *
 * Query params:
 * - period: 'week' | 'month' | 'all' (default: 'month')
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { subtractDays } from '@/utils/date';
import { calculateBMI } from '@/utils/bmi';

interface TrendPoint {
  date: string;
  weight: number;
  bodyFatPercentage: number | null;
  bmi: number | null;
}

interface WeeklyAverage {
  weekStart: string;
  avgWeight: number;
  avgBodyFat: number | null;
}

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
    const period = searchParams.get('period') || 'month';

    // Calculate date range
    const today = new Date();
    let startDate: Date | undefined;

    switch (period) {
      case 'week':
        startDate = subtractDays(today, 7);
        break;
      case 'month':
        startDate = subtractDays(today, 30);
        break;
      case 'all':
        startDate = undefined;
        break;
      default:
        startDate = subtractDays(today, 30);
    }

    const where = {
      userId: user.id,
      ...(startDate && { date: { gte: startDate } }),
    };

    const metrics = await prisma.bodyMetrics.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    if (metrics.length === 0) {
      return NextResponse.json({
        trendPoints: [],
        weeklyAverages: [],
        summary: null,
        trends: null,
      });
    }

    // Build trend points for charting
    const trendPoints: TrendPoint[] = metrics.map((m) => ({
      date: m.date.toISOString().split('T')[0],
      weight: m.weight,
      bodyFatPercentage: m.bodyFatPercentage,
      bmi: user.height ? calculateBMI(m.weight, user.height)?.value ?? null : null,
    }));

    // Calculate weekly averages
    const weeklyAverages: WeeklyAverage[] = [];
    const weekMap = new Map<string, { weights: number[]; bodyFats: number[] }>();

    for (const m of metrics) {
      const date = new Date(m.date);
      // Get Monday of the week
      const day = date.getDay();
      const monday = new Date(date);
      monday.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
      const weekKey = monday.toISOString().split('T')[0];

      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, { weights: [], bodyFats: [] });
      }

      const week = weekMap.get(weekKey)!;
      week.weights.push(m.weight);
      if (m.bodyFatPercentage !== null) week.bodyFats.push(m.bodyFatPercentage);
    }

    for (const [weekStart, data] of weekMap.entries()) {
      const avgWeight = data.weights.reduce((a, b) => a + b, 0) / data.weights.length;
      const avgBodyFat = data.bodyFats.length > 0
        ? data.bodyFats.reduce((a, b) => a + b, 0) / data.bodyFats.length
        : null;

      weeklyAverages.push({
        weekStart,
        avgWeight: Math.round(avgWeight * 10) / 10,
        avgBodyFat: avgBodyFat !== null ? Math.round(avgBodyFat * 1000) / 1000 : null,
      });
    }

    weeklyAverages.sort((a, b) => a.weekStart.localeCompare(b.weekStart));

    // Calculate summary stats
    const first = metrics[0];
    const last = metrics[metrics.length - 1];
    const daysBetween = Math.ceil(
      (new Date(last.date).getTime() - new Date(first.date).getTime()) / (1000 * 60 * 60 * 24)
    );

    const summary = {
      totalRecords: metrics.length,
      daysCovered: daysBetween + 1,
      startWeight: first.weight,
      currentWeight: last.weight,
      weightChange: Math.round((last.weight - first.weight) * 10) / 10,
      startBodyFat: first.bodyFatPercentage,
      currentBodyFat: last.bodyFatPercentage,
      bodyFatChange: first.bodyFatPercentage && last.bodyFatPercentage
        ? Math.round((last.bodyFatPercentage - first.bodyFatPercentage) * 1000) / 1000
        : null,
      currentBMI: user.height ? calculateBMI(last.weight, user.height) : null,
    };

    // Calculate trends (rate of change per week)
    let trends = null;
    if (daysBetween >= 7 && weeklyAverages.length >= 2) {
      const firstWeek = weeklyAverages[0];
      const lastWeek = weeklyAverages[weeklyAverages.length - 1];
      const weeks = weeklyAverages.length;

      const weightTrendPerWeek = (lastWeek.avgWeight - firstWeek.avgWeight) / (weeks - 1);
      const bodyFatTrendPerWeek = firstWeek.avgBodyFat !== null && lastWeek.avgBodyFat !== null
        ? (lastWeek.avgBodyFat - firstWeek.avgBodyFat) / (weeks - 1)
        : null;

      trends = {
        weightPerWeek: Math.round(weightTrendPerWeek * 100) / 100,
        weightDirection: weightTrendPerWeek < -0.1 ? 'decreasing' : weightTrendPerWeek > 0.1 ? 'increasing' : 'stable',
        bodyFatPerWeek: bodyFatTrendPerWeek !== null ? Math.round(bodyFatTrendPerWeek * 10000) / 10000 : null,
        bodyFatDirection: bodyFatTrendPerWeek !== null
          ? (bodyFatTrendPerWeek < -0.001 ? 'decreasing' : bodyFatTrendPerWeek > 0.001 ? 'increasing' : 'stable')
          : null,
      };
    }

    return NextResponse.json({
      trendPoints,
      weeklyAverages,
      summary,
      trends,
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trends' },
      { status: 500 }
    );
  }
}
