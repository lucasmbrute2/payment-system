/*
  Warnings:

  - A unique constraint covering the columns `[number]` on the table `Block` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Block_number_key" ON "Block"("number");
