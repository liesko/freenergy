-- CreateEnum
CREATE TYPE "AcceptedMeteringPointType" AS ENUM ('BOTH', 'PRODUCTION_ONLY', 'CONSUMPTION_ONLY');

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "acceptedMeteringPointTypes" "AcceptedMeteringPointType" NOT NULL DEFAULT 'BOTH',
ADD COLUMN     "acceptsInvitations" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "acceptsJoinRequests" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
