-- AlterTable
ALTER TABLE "MeteringPoint" ADD COLUMN     "groupId" TEXT;

-- AddForeignKey
ALTER TABLE "MeteringPoint" ADD CONSTRAINT "MeteringPoint_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
