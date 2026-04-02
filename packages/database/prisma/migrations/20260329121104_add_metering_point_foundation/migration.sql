-- CreateEnum
CREATE TYPE "MeteringPointType" AS ENUM ('PRODUCTION', 'CONSUMPTION');

-- CreateTable
CREATE TABLE "MeteringPoint" (
    "id" TEXT NOT NULL,
    "eic" TEXT NOT NULL,
    "name" TEXT,
    "type" "MeteringPointType" NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeteringPoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MeteringPoint_eic_key" ON "MeteringPoint"("eic");

-- AddForeignKey
ALTER TABLE "MeteringPoint" ADD CONSTRAINT "MeteringPoint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
