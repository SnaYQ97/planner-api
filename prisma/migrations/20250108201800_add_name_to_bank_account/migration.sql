-- AlterTable
ALTER TABLE "BankAccount" ADD COLUMN     "name" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "currentSpent" DECIMAL(65,30) NOT NULL DEFAULT 0;
