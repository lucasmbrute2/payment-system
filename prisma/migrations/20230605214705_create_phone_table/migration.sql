-- CreateTable
CREATE TABLE "Phone" (
    "id" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL DEFAULT '55',
    "area" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'MOBILE',
    "residentId" TEXT,

    CONSTRAINT "Phone_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Phone" ADD CONSTRAINT "Phone_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "Resident"("id") ON DELETE SET NULL ON UPDATE CASCADE;
