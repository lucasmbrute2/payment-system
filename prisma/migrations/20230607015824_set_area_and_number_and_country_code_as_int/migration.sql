/*
  Warnings:

  - The `countryCode` column on the `Phone` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `area` on the `Phone` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `number` on the `Phone` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Phone" DROP COLUMN "countryCode",
ADD COLUMN     "countryCode" INTEGER NOT NULL DEFAULT 55,
DROP COLUMN "area",
ADD COLUMN     "area" INTEGER NOT NULL,
DROP COLUMN "number",
ADD COLUMN     "number" INTEGER NOT NULL;
