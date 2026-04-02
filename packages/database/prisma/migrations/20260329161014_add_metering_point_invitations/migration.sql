-- AlterEnum
ALTER TYPE "InvitationStatus" ADD VALUE 'CANCELLED';

-- CreateTable
CREATE TABLE "GroupMeteringPointInvitation" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "meteringPointId" TEXT NOT NULL,
    "invitedByUserId" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "GroupMeteringPointInvitation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GroupMeteringPointInvitation" ADD CONSTRAINT "GroupMeteringPointInvitation_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMeteringPointInvitation" ADD CONSTRAINT "GroupMeteringPointInvitation_meteringPointId_fkey" FOREIGN KEY ("meteringPointId") REFERENCES "MeteringPoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMeteringPointInvitation" ADD CONSTRAINT "GroupMeteringPointInvitation_invitedByUserId_fkey" FOREIGN KEY ("invitedByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
