import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MeteringPointInvitationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForUser(userId: string) {
    return this.prisma.groupMeteringPointInvitation.findMany({
      where: {
        meteringPoint: { userId },
        status: 'PENDING',
      },
      include: {
        group: { select: { name: true, id: true } },
        meteringPoint: { select: { eic: true, name: true, id: true, type: true } },
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async accept(invitationId: string, userId: string) {
    const invitation = await this.prisma.groupMeteringPointInvitation.findUnique({
      where: { id: invitationId },
      include: { meteringPoint: true },
    });

    if (!invitation) throw new NotFoundException('Pozvánka nebola nájdená');
    if (invitation.status !== 'PENDING') throw new BadRequestException(`Pozvánka už je v stave ${invitation.status}`);
    if (invitation.meteringPoint.userId !== userId) throw new BadRequestException('Iba vlastník zariadenia môže prijať túto pozvánku');

    return this.prisma.$transaction(async (tx: any) => {
      // Re-verify the asset is strictly free
      const point = await tx.meteringPoint.findUnique({ where: { id: invitation.meteringPointId } });
      if (point?.groupId) throw new BadRequestException('Zariadenie bolo medzitým priradené inam');

      // Update the invitation to ACCEPTED
      const updatedInv = await tx.groupMeteringPointInvitation.update({
        where: { id: invitationId },
        data: { status: 'ACCEPTED', respondedAt: new Date() },
      });

      // Bind the hardware structurally
      await tx.meteringPoint.update({
        where: { id: invitation.meteringPointId },
        data: { groupId: invitation.groupId }
      });

      // Cancel any other outbound JoinRequests this physical asset had sitting around blindly
      await tx.groupJoinRequest.updateMany({
        where: { meteringPointId: invitation.meteringPointId, status: 'PENDING' },
        data: { status: 'CANCELLED', respondedAt: new Date() }
      });

      // Cancel any other inbound invitations this asset has passively pending
      await tx.groupMeteringPointInvitation.updateMany({
        where: { meteringPointId: invitation.meteringPointId, status: 'PENDING', id: { not: invitationId } },
        data: { status: 'CANCELLED', respondedAt: new Date() }
      });

      return updatedInv;
    });
  }

  async reject(invitationId: string, userId: string) {
    const invitation = await this.prisma.groupMeteringPointInvitation.findUnique({
      where: { id: invitationId },
      include: { meteringPoint: true },
    });

    if (!invitation) throw new NotFoundException('Pozvánka nebola nájdená');
    if (invitation.status !== 'PENDING') throw new BadRequestException(`Pozvánka už je v stave ${invitation.status}`);
    if (invitation.meteringPoint.userId !== userId) throw new BadRequestException('Iba vlastník zariadenia môže zamietnuť túto pozvánku');

    return this.prisma.groupMeteringPointInvitation.update({
      where: { id: invitationId },
      data: { status: 'REJECTED', respondedAt: new Date() },
    });
  }
}
