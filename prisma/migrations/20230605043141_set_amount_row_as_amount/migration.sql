/*
  Warnings:

  - You are about to drop the column `Amount` on the `Invoices` table. All the data in the column will be lost.
  - Added the required column `amount` to the `Invoices` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Invoices" DROP COLUMN "Amount",
ADD COLUMN     "amount" INTEGER NOT NULL;
