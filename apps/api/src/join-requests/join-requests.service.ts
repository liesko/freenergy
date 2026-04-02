import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JoinRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async approve(requestId: string, userId: string) {
    const request = await this.prisma.groupJoinRequest.findUnique({
      where: { id: requestId },
      include: { meteringPoint: true },
    });

    if (!request) {
      throw new NotFoundException('Žiadosť o pripojenie nebola nájdená.');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException(`Žiadosť už je v stave ${request.status}.`);
    }

    // Verify ownership/permission of the approver (must be group OWNER)
    const group = await this.prisma.group.findUnique({
      where: { id: request.groupId },
      include: { memberships: { where: { userId, role: 'OWNER' } } }
    });

    if (!group || (group.ownerId !== userId && group.memberships.length === 0)) {
      throw new BadRequestException('Iba vlastníci skupiny môžu schvaľovať žiadosti o pripojenie.');
    }

    // Verify metering point is not already assigned
    if (request.meteringPoint.groupId) {
      throw new BadRequestException('Požadované zariadenie už bolo priradené do inej skupiny.');
    }

    // Transaction-safe approval
    return this.prisma.$transaction(async (tx: any) => {
      // 1. Double-check point is still available using read lock logic equivalent inside the transaction
      const point = await tx.meteringPoint.findUnique({
        where: { id: request.meteringPointId },
      });

      if (point?.groupId) {
        throw new BadRequestException('Zariadenie bolo medzitým priradené inam.');
      }

      // 2. Mark this request as accepted
      const approvedRequest = await tx.groupJoinRequest.update({
        where: { id: requestId },
        data: {
          status: 'ACCEPTED',
          respondedAt: new Date(),
        },
      });

      // 3. Assign the MeteringPoint to the Group
      await tx.meteringPoint.update({
        where: { id: request.meteringPointId },
        data: { groupId: request.groupId },
      });

      // 4. Cancel all other pending requests for THIS metering point
      await tx.groupJoinRequest.updateMany({
        where: {
          meteringPointId: request.meteringPointId,
          status: 'PENDING',
          id: { not: requestId },
        },
        data: {
          status: 'CANCELLED',
          respondedAt: new Date(),
        },
      });

      return approvedRequest;
    });
  }

  async reject(requestId: string, userId: string) {
    const request = await this.prisma.groupJoinRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Žiadosť o pripojenie nebola nájdená.');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException(`Žiadosť už je v stave ${request.status}.`);
    }

    const group = await this.prisma.group.findUnique({
      where: { id: request.groupId },
      include: { memberships: { where: { userId, role: 'OWNER' } } }
    });

    if (!group || (group.ownerId !== userId && group.memberships.length === 0)) {
      throw new BadRequestException('Iba vlastníci skupiny môžu zamietnuť žiadosti o pripojenie.');
    }

    return this.prisma.groupJoinRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
        respondedAt: new Date(),
      },
    });
  }

  async cancel(requestId: string, userId: string) {
    const request = await this.prisma.groupJoinRequest.findUnique({
      where: { id: requestId },
      include: { meteringPoint: true },
    });

    if (!request) {
      throw new NotFoundException('Žiadosť o pripojenie nebola nájdená.');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException(`Žiadosť už je v stave ${request.status}.`);
    }

    // Verify ownership of the metering point (only the MP owner can cancel their own request)
    if (request.meteringPoint.userId !== userId) {
      throw new BadRequestException('Iba vlastník pripojeného miesta môže zrušiť túto žiadosť.');
    }

    return this.prisma.groupJoinRequest.update({
      where: { id: requestId },
      data: {
        status: 'CANCELLED',
        respondedAt: new Date(),
      },
    });
  }
}
