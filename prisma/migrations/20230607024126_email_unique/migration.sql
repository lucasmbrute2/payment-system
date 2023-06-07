/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Resident` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Resident" ALTER COLUMN "nonPayments" SET DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Resident_email_key" ON "Resident"("email");
