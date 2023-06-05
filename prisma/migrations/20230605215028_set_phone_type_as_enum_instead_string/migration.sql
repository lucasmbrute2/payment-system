/*
  Warnings:

  - The `type` column on the `Phone` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PhoneType" AS ENUM ('MOBILE', 'BUSINESS', 'HOME');

-- AlterTable
ALTER TABLE "Phone" DROP COLUMN "type",
ADD COLUMN     "type" "PhoneType" NOT NULL DEFAULT 'MOBILE';
