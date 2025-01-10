/*
  Warnings:

  - You are about to drop the column `interestPeriod` on the `BankAccount` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BankAccount" DROP COLUMN "interestPeriod",
ADD COLUMN     "interestEndDate" TIMESTAMP(3),
ADD COLUMN     "interestRateLimit" DECIMAL(65,30),
ADD COLUMN     "interestStartDate" TIMESTAMP(3);
