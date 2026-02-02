-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "CyclePattern" AS ENUM ('PATTERN_112', 'PATTERN_113');

-- CreateEnum
CREATE TYPE "CarbDayType" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ProteinSource" AS ENUM ('CHICKEN', 'BEEF', 'SHRIMP');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "bodyFatPercentage" DOUBLE PRECISION NOT NULL,
    "goalType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BodyMetrics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "bodyFatPercentage" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BodyMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CyclePlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "cyclePattern" "CyclePattern" NOT NULL,
    "status" "PlanStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CyclePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyMealPlan" (
    "id" TEXT NOT NULL,
    "cyclePlanId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "carbDayType" "CarbDayType" NOT NULL,
    "oatmealGrams" DOUBLE PRECISION NOT NULL,
    "riceGramsLunch" DOUBLE PRECISION NOT NULL,
    "riceGramsDinner" DOUBLE PRECISION NOT NULL,
    "proteinGramsMeal1" DOUBLE PRECISION NOT NULL,
    "proteinGramsMeal2" DOUBLE PRECISION NOT NULL,
    "proteinGramsMeal3" DOUBLE PRECISION NOT NULL,
    "proteinGramsMeal4" DOUBLE PRECISION NOT NULL,
    "proteinSource" "ProteinSource" NOT NULL,
    "oliveoilMl" DOUBLE PRECISION NOT NULL,
    "allowWholeEgg" BOOLEAN NOT NULL,
    "waterLiters" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyMealPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyIntakeRecord" (
    "id" TEXT NOT NULL,
    "dailyMealPlanId" TEXT NOT NULL,
    "oatmealCompleted" BOOLEAN NOT NULL DEFAULT false,
    "riceLunchCompleted" BOOLEAN NOT NULL DEFAULT false,
    "riceDinnerCompleted" BOOLEAN NOT NULL DEFAULT false,
    "protein1Completed" BOOLEAN NOT NULL DEFAULT false,
    "protein2Completed" BOOLEAN NOT NULL DEFAULT false,
    "protein3Completed" BOOLEAN NOT NULL DEFAULT false,
    "protein4Completed" BOOLEAN NOT NULL DEFAULT false,
    "waterCompleted" BOOLEAN NOT NULL DEFAULT false,
    "followedPlan" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyIntakeRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "strengthCompleted" BOOLEAN NOT NULL DEFAULT false,
    "cardioSession1" BOOLEAN NOT NULL DEFAULT false,
    "cardioSession2" BOOLEAN NOT NULL DEFAULT false,
    "cardioMinutes" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExerciseRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CycleSummary" (
    "id" TEXT NOT NULL,
    "cyclePlanId" TEXT NOT NULL,
    "totalDays" INTEGER NOT NULL,
    "daysFollowed" INTEGER NOT NULL,
    "daysNotFollowed" INTEGER NOT NULL,
    "startWeight" DOUBLE PRECISION NOT NULL,
    "endWeight" DOUBLE PRECISION,
    "startBodyFat" DOUBLE PRECISION,
    "endBodyFat" DOUBLE PRECISION,
    "notFollowedDates" DATE[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CycleSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BodyMetrics_userId_date_key" ON "BodyMetrics"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyMealPlan_cyclePlanId_date_key" ON "DailyMealPlan"("cyclePlanId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyIntakeRecord_dailyMealPlanId_key" ON "DailyIntakeRecord"("dailyMealPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseRecord_userId_date_key" ON "ExerciseRecord"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "CycleSummary_cyclePlanId_key" ON "CycleSummary"("cyclePlanId");

-- AddForeignKey
ALTER TABLE "BodyMetrics" ADD CONSTRAINT "BodyMetrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CyclePlan" ADD CONSTRAINT "CyclePlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyMealPlan" ADD CONSTRAINT "DailyMealPlan_cyclePlanId_fkey" FOREIGN KEY ("cyclePlanId") REFERENCES "CyclePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyIntakeRecord" ADD CONSTRAINT "DailyIntakeRecord_dailyMealPlanId_fkey" FOREIGN KEY ("dailyMealPlanId") REFERENCES "DailyMealPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseRecord" ADD CONSTRAINT "ExerciseRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CycleSummary" ADD CONSTRAINT "CycleSummary_cyclePlanId_fkey" FOREIGN KEY ("cyclePlanId") REFERENCES "CyclePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
