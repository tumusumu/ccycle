import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { parseDate } from '@/utils/date';

interface RouteParams {
  params: Promise<{
    date: string;
  }>;
}

// GET - 获取指定日期的摄入记录
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { date: dateStr } = await params;
    const targetDate = parseDate(dateStr);

    // 获取活跃的计划
    const plan = await prisma.cyclePlan.findFirst({
      where: {
        userId: user.id,
        status: 'ACTIVE',
      },
    });

    if (!plan) {
      return NextResponse.json(
        { error: '没有活跃的计划', code: 'NO_PLAN' },
        { status: 404 }
      );
    }

    // 查找该日期的 DailyMealPlan
    const mealPlan = await prisma.dailyMealPlan.findFirst({
      where: {
        cyclePlanId: plan.id,
        date: targetDate,
      },
      include: {
        intakeRecord: true,
      },
    });

    if (!mealPlan) {
      return NextResponse.json(
        { error: '该日期没有饮食计划', code: 'NO_MEAL_PLAN' },
        { status: 404 }
      );
    }

    // 获取运动记录
    const exerciseRecord = await prisma.exerciseRecord.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: targetDate,
        },
      },
    });

    // 构建 intake 响应
    const intake = mealPlan.intakeRecord;

    return NextResponse.json({
      ok: true,
      dailyMealPlanId: mealPlan.id,
      carbDayType: mealPlan.carbDayType,
      intake: intake ? {
        // Breakfast
        oatmealGrams: intake.actualOatmealGrams ?? 0,
        wholeEggs: intake.actualWholeEggs ?? 0,
        whiteOnlyEggs: intake.actualWhiteOnlyEggs ?? 0,
        breakfastCompleted: intake.oatmealCompleted && intake.protein1Completed,
        // Lunch
        lunchRiceGrams: intake.actualLunchRiceGrams ?? 0,
        lunchMeatType: intake.actualLunchMeatType ?? '',
        lunchMeatGrams: intake.actualLunchMeatGrams ?? 0,
        lunchOliveOilMl: intake.actualLunchOliveOilMl ?? 0,
        lunchCompleted: intake.riceLunchCompleted && intake.protein2Completed,
        // Snack
        snackRiceGrams: intake.actualSnackRiceGrams ?? 0,
        snackMeatType: intake.actualSnackProteinType ?? '',
        snackMeatGrams: intake.actualSnackProteinGrams ?? 0,
        snackCompleted: intake.protein3Completed,
        // Dinner
        dinnerRiceGrams: intake.actualDinnerRiceGrams ?? 0,
        dinnerMeatType: intake.actualDinnerMeatType ?? '',
        dinnerMeatGrams: intake.actualDinnerMeatGrams ?? 0,
        dinnerOliveOilMl: intake.actualDinnerOliveOilMl ?? 0,
        dinnerCompleted: intake.riceDinnerCompleted && intake.protein4Completed,
        // Exercise
        strengthMinutes: exerciseRecord?.strengthCompleted ? (intake.actualStrengthMinutes ?? 0) : 0,
        strengthCompleted: exerciseRecord?.strengthCompleted ?? false,
        cardioMinutes: (exerciseRecord?.cardioSession1 || exerciseRecord?.cardioSession2)
          ? (intake.actualCardioMinutes ?? exerciseRecord?.cardioMinutes ?? 0)
          : 0,
        cardioCompleted: (exerciseRecord?.cardioSession1 || exerciseRecord?.cardioSession2) ?? false,
      } : null,
      dietRestrictions: intake ? {
        noFruit: intake.noFruitConfirmed ?? false,
        noSugar: intake.noSugarConfirmed ?? false,
        noWhiteFlour: intake.noWhiteFlourConfirmed ?? false,
      } : null,
    });
  } catch (error) {
    console.error('获取历史记录失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

// PUT - 更新指定日期的摄入记录
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { date: dateStr } = await params;
    const targetDate = parseDate(dateStr);
    const body = await request.json();

    // 获取活跃的计划
    const plan = await prisma.cyclePlan.findFirst({
      where: {
        userId: user.id,
        status: 'ACTIVE',
      },
    });

    if (!plan) {
      return NextResponse.json(
        { error: '没有活跃的计划', code: 'NO_PLAN' },
        { status: 404 }
      );
    }

    // 查找该日期的 DailyMealPlan
    const mealPlan = await prisma.dailyMealPlan.findFirst({
      where: {
        cyclePlanId: plan.id,
        date: targetDate,
      },
    });

    if (!mealPlan) {
      return NextResponse.json(
        { error: '该日期没有饮食计划', code: 'NO_MEAL_PLAN' },
        { status: 404 }
      );
    }

    // 构建更新数据
    const intakeUpdateData: Record<string, boolean | number | string | null> = {};

    // Breakfast
    if (body.oatmealGrams !== undefined) intakeUpdateData.actualOatmealGrams = body.oatmealGrams;
    if (body.wholeEggs !== undefined) intakeUpdateData.actualWholeEggs = body.wholeEggs;
    if (body.whiteOnlyEggs !== undefined) intakeUpdateData.actualWhiteOnlyEggs = body.whiteOnlyEggs;
    if (body.breakfastCompleted !== undefined) {
      intakeUpdateData.oatmealCompleted = body.breakfastCompleted;
      intakeUpdateData.protein1Completed = body.breakfastCompleted;
    }

    // Lunch
    if (body.lunchRiceGrams !== undefined) intakeUpdateData.actualLunchRiceGrams = body.lunchRiceGrams;
    if (body.lunchMeatType !== undefined) intakeUpdateData.actualLunchMeatType = body.lunchMeatType;
    if (body.lunchMeatGrams !== undefined) intakeUpdateData.actualLunchMeatGrams = body.lunchMeatGrams;
    if (body.lunchOliveOilMl !== undefined) intakeUpdateData.actualLunchOliveOilMl = body.lunchOliveOilMl;
    if (body.lunchCompleted !== undefined) {
      intakeUpdateData.riceLunchCompleted = body.lunchCompleted;
      intakeUpdateData.protein2Completed = body.lunchCompleted;
    }

    // Snack
    if (body.snackRiceGrams !== undefined) intakeUpdateData.actualSnackRiceGrams = body.snackRiceGrams;
    if (body.snackMeatType !== undefined) intakeUpdateData.actualSnackProteinType = body.snackMeatType;
    if (body.snackMeatGrams !== undefined) intakeUpdateData.actualSnackProteinGrams = body.snackMeatGrams;
    if (body.snackCompleted !== undefined) intakeUpdateData.protein3Completed = body.snackCompleted;

    // Dinner
    if (body.dinnerRiceGrams !== undefined) intakeUpdateData.actualDinnerRiceGrams = body.dinnerRiceGrams;
    if (body.dinnerMeatType !== undefined) intakeUpdateData.actualDinnerMeatType = body.dinnerMeatType;
    if (body.dinnerMeatGrams !== undefined) intakeUpdateData.actualDinnerMeatGrams = body.dinnerMeatGrams;
    if (body.dinnerOliveOilMl !== undefined) intakeUpdateData.actualDinnerOliveOilMl = body.dinnerOliveOilMl;
    if (body.dinnerCompleted !== undefined) {
      intakeUpdateData.riceDinnerCompleted = body.dinnerCompleted;
      intakeUpdateData.protein4Completed = body.dinnerCompleted;
    }

    // Exercise minutes
    if (body.strengthMinutes !== undefined) intakeUpdateData.actualStrengthMinutes = body.strengthMinutes;
    if (body.cardioMinutes !== undefined) intakeUpdateData.actualCardioMinutes = body.cardioMinutes;

    // Diet restrictions (控糖打卡)
    if (body.noFruit !== undefined) intakeUpdateData.noFruitConfirmed = body.noFruit;
    if (body.noSugar !== undefined) intakeUpdateData.noSugarConfirmed = body.noSugar;
    if (body.noWhiteFlour !== undefined) intakeUpdateData.noWhiteFlourConfirmed = body.noWhiteFlour;

    // Upsert intake record
    const intakeRecord = await prisma.dailyIntakeRecord.upsert({
      where: { dailyMealPlanId: mealPlan.id },
      update: intakeUpdateData,
      create: {
        dailyMealPlanId: mealPlan.id,
        ...intakeUpdateData,
      },
    });

    // 更新运动记录（如果有运动数据）
    if (body.strengthCompleted !== undefined || body.cardioCompleted !== undefined) {
      await prisma.exerciseRecord.upsert({
        where: {
          userId_date: {
            userId: user.id,
            date: targetDate,
          },
        },
        update: {
          ...(body.strengthCompleted !== undefined && {
            strengthCompleted: body.strengthCompleted,
          }),
          ...(body.cardioCompleted !== undefined && {
            cardioSession1: body.cardioCompleted,
          }),
          ...(body.cardioMinutes !== undefined && {
            cardioMinutes: body.cardioMinutes,
          }),
        },
        create: {
          userId: user.id,
          date: targetDate,
          strengthCompleted: body.strengthCompleted ?? false,
          cardioSession1: body.cardioCompleted ?? false,
          cardioMinutes: body.cardioMinutes,
        },
      });
    }

    return NextResponse.json({
      success: true,
      dailyMealPlanId: mealPlan.id,
      intakeRecord,
    });
  } catch (error) {
    console.error('保存历史记录失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
