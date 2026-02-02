-- Add height field to User table for BMI calculation
ALTER TABLE "User" ADD COLUMN "height" DOUBLE PRECISION;

-- Add new fields to BodyMetrics table
ALTER TABLE "BodyMetrics" ADD COLUMN "muscleMass" DOUBLE PRECISION;
ALTER TABLE "BodyMetrics" ADD COLUMN "waistCircumference" DOUBLE PRECISION;
ALTER TABLE "BodyMetrics" ADD COLUMN "note" TEXT;

-- Create GoalType enum
CREATE TYPE "GoalType" AS ENUM ('WEIGHT', 'BODY_FAT', 'MUSCLE_MASS');

-- Create GoalStatus enum
CREATE TYPE "GoalStatus" AS ENUM ('ACTIVE', 'ACHIEVED', 'CANCELLED');

-- Create MetricGoal table
CREATE TABLE "MetricGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goalType" "GoalType" NOT NULL,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "startValue" DOUBLE PRECISION NOT NULL,
    "startDate" DATE NOT NULL,
    "targetDate" DATE,
    "achievedAt" TIMESTAMP(3),
    "status" "GoalStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MetricGoal_pkey" PRIMARY KEY ("id")
);

-- Create index on MetricGoal for userId and status
CREATE INDEX "MetricGoal_userId_status_idx" ON "MetricGoal"("userId", "status");

-- Add foreign key constraint
ALTER TABLE "MetricGoal" ADD CONSTRAINT "MetricGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
