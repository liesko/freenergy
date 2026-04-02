import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvitationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForUser(userId: string) {
    return this.prisma.groupInvitation.findMany({
      where: {
        invitedUserId: userId,
        status: 'PENDING',
      },
      include: {
        group: {
          select: { name: true, description: true },
        },
        invitedByUser: {
          select: { email: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async accept(id: string, userId: string) {
    const invite = await this.prisma.groupInvitation.findFirst({
      where: {
        id,
        invitedUserId: userId,
        status: 'PENDING',
      },
    });

    if (!invite) {
      throw new NotFoundException('Pozvánka nebola nájdená alebo už nečaká na vybavenie.');
    }
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.groupInvitation.update({
        where: { id: invite.id },
        data: {
          status: 'ACCEPTED',
          respondedAt: new Date(),
        },
      });

      // Insert membership safely covering duplicates logic
      await tx.membership.upsert({
        where: {
          userId_groupId: {
            userId: userId,
            groupId: invite.groupId,
          },
        },
        update: {},
        create: {
          userId: userId,
          groupId: invite.groupId,
          role: 'MEMBER',
        },
      });

      return updated;
    });
  }

  async reject(id: string, userId: string) {
    const invite = await this.prisma.groupInvitation.findFirst({
      where: {
        id,
        invitedUserId: userId,
        status: 'PENDING',
      },
    });

    if (!invite) {
      throw new NotFoundException('Pozvánka nebola nájdená alebo už nečaká na vybavenie.');
    }

    return this.prisma.groupInvitation.update({
      where: { id: invite.id },
      data: {
        status: 'REJECTED',
        respondedAt: new Date(),
      },
    });
  }
}
