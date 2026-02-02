/**
 * Individual Body Metrics API Routes
 * GET: Get a single record by ID
 * PATCH: Update a record
 * DELETE: Delete a record
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { IBodyMetricsInput } from '@/types/user';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const metrics = await prisma.bodyMetrics.findUnique({
      where: { id },
    });

    if (!metrics) {
      return NextResponse.json(
        { error: 'Body metrics record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching body metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch body metrics' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Partial<IBodyMetricsInput>;

    const existingMetrics = await prisma.bodyMetrics.findUnique({
      where: { id },
    });

    if (!existingMetrics) {
      return NextResponse.json(
        { error: 'Body metrics record not found' },
        { status: 404 }
      );
    }

    // Validate values if provided
    if (body.weight !== undefined && (body.weight <= 0 || body.weight > 300)) {
      return NextResponse.json(
        { error: 'Weight must be between 0 and 300 kg' },
        { status: 400 }
      );
    }

    if (
      body.bodyFatPercentage !== undefined &&
      body.bodyFatPercentage !== null &&
      (body.bodyFatPercentage < 0 || body.bodyFatPercentage > 1)
    ) {
      return NextResponse.json(
        { error: 'Body fat percentage must be between 0 and 1' },
        { status: 400 }
      );
    }

    if (
      body.muscleMass !== undefined &&
      body.muscleMass !== null &&
      (body.muscleMass <= 0 || body.muscleMass > 150)
    ) {
      return NextResponse.json(
        { error: 'Muscle mass must be between 0 and 150 kg' },
        { status: 400 }
      );
    }

    if (
      body.waistCircumference !== undefined &&
      body.waistCircumference !== null &&
      (body.waistCircumference <= 0 || body.waistCircumference > 300)
    ) {
      return NextResponse.json(
        { error: 'Waist circumference must be between 0 and 300 cm' },
        { status: 400 }
      );
    }

    const updateData: {
      weight?: number;
      bodyFatPercentage?: number | null;
      muscleMass?: number | null;
      waistCircumference?: number | null;
      note?: string | null;
    } = {};

    if (body.weight !== undefined) updateData.weight = body.weight;
    if (body.bodyFatPercentage !== undefined) updateData.bodyFatPercentage = body.bodyFatPercentage;
    if (body.muscleMass !== undefined) updateData.muscleMass = body.muscleMass;
    if (body.waistCircumference !== undefined) updateData.waistCircumference = body.waistCircumference;
    if (body.note !== undefined) updateData.note = body.note;

    const metrics = await prisma.bodyMetrics.update({
      where: { id },
      data: updateData,
    });

    // If updating the most recent record, also update user's current values
    const latestMetrics = await prisma.bodyMetrics.findFirst({
      where: { userId: existingMetrics.userId },
      orderBy: { date: 'desc' },
    });

    if (latestMetrics?.id === id) {
      await prisma.user.update({
        where: { id: existingMetrics.userId },
        data: {
          ...(updateData.weight !== undefined && { weight: updateData.weight }),
          ...(updateData.bodyFatPercentage !== undefined && {
            bodyFatPercentage: updateData.bodyFatPercentage ?? undefined,
          }),
        },
      });
    }

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error updating body metrics:', error);
    return NextResponse.json(
      { error: 'Failed to update body metrics' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existingMetrics = await prisma.bodyMetrics.findUnique({
      where: { id },
    });

    if (!existingMetrics) {
      return NextResponse.json(
        { error: 'Body metrics record not found' },
        { status: 404 }
      );
    }

    await prisma.bodyMetrics.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting body metrics:', error);
    return NextResponse.json(
      { error: 'Failed to delete body metrics' },
      { status: 500 }
    );
  }
}
