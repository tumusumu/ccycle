/*
  Warnings:

  - You are about to drop the column `proteinSource` on the `DailyMealPlan` table. All the data in the column will be lost.
  - Added the required column `proteinSourceMeal1` to the `DailyMealPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `proteinSourceMeal2` to the `DailyMealPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `proteinSourceMeal3` to the `DailyMealPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `proteinSourceMeal4` to the `DailyMealPlan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DailyMealPlan" DROP COLUMN "proteinSource",
ADD COLUMN     "proteinSourceMeal1" "ProteinSource" NOT NULL,
ADD COLUMN     "proteinSourceMeal2" "ProteinSource" NOT NULL,
ADD COLUMN     "proteinSourceMeal3" "ProteinSource" NOT NULL,
ADD COLUMN     "proteinSourceMeal4" "ProteinSource" NOT NULL;
