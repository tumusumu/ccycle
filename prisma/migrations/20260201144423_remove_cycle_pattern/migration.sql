/*
  Warnings:

  - You are about to drop the column `cyclePattern` on the `CyclePlan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CyclePlan" DROP COLUMN "cyclePattern";

-- DropEnum
DROP TYPE "CyclePattern";
