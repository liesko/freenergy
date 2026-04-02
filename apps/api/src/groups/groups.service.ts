import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createGroupDto: CreateGroupDto) {
    return this.prisma.group.create({
      data: {
        name: createGroupDto.name,
        description: createGroupDto.description,
        ownerId: userId,
        memberships: {
          create: {
            userId: userId,
            role: 'OWNER',
          },
        },
      },
    });
  }

  async findAllForUser(userId: string) {
    return this.prisma.group.findMany({
      where: {
        memberships: {
          some: { userId },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneForUser(id: string, userId: string) {
    const group = await this.prisma.group.findFirst({
      where: {
        id,
        memberships: {
          some: { userId },
        },
      },
    });

    if (!group) {
      throw new NotFoundException(`Skupina nebola nájdená alebo k nej nemáte prístup.`);
    }

    return group;
  }

  async findMembers(groupId: string, userId: string) {
    // Verify access first
    await this.findOneForUser(groupId, userId);

    return this.prisma.membership.findMany({
      where: { groupId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async inviteUser(groupId: string, ownerId: string, email: string) {
    const membership = await this.prisma.membership.findFirst({
      where: {
        groupId,
        userId: ownerId,
        role: 'OWNER',
      },
    });

    if (!membership) {
      throw new BadRequestException('Iba vlastníci skupiny môžu pozývať členov.');
    }

    const invitedUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!invitedUser) {
      throw new BadRequestException('Používateľ s týmto e-mailom nebol nájdený.');
    }

    if (invitedUser.id === ownerId) {
      throw new BadRequestException('Nemôžete pozvať sami seba.');
    }

    const existingMembership = await this.prisma.membership.findFirst({
      where: {
        groupId,
        userId: invitedUser.id,
      },
    });

    if (existingMembership) {
      throw new BadRequestException('Používateľ už je členom tejto skupiny.');
    }

    const existingInvitation = await this.prisma.groupInvitation.findFirst({
      where: {
        groupId,
        invitedUserId: invitedUser.id,
        status: 'PENDING',
      },
    });

    if (existingInvitation) {
      throw new BadRequestException('Pre tohto používateľa už existuje čakajúca pozvánka.');
    }

    return this.prisma.groupInvitation.create({
      data: {
        groupId,
        invitedUserId: invitedUser.id,
        invitedByUserId: ownerId,
      },
    });
  }

  async assignMeteringPoint(groupId: string, userId: string, dto: import('./dto/assign-metering-point.dto').AssignMeteringPointDto) {
    // 1. Verify group access (user must be a member)
    await this.findOneForUser(groupId, userId);

    // 2. Retrieve metering point
    const point = await this.prisma.meteringPoint.findUnique({
      where: { id: dto.meteringPointId },
    });

    if (!point) {
      throw new NotFoundException('Pripojené miesto nebolo nájdené.');
    }

    if (point.userId !== userId) {
      throw new BadRequestException('Nie ste vlastníkom tohto pripojeného miesta.');
    }

    if (point.groupId) {
      throw new BadRequestException('Toto pripojené miesto je už priradené k skupine.');
    }

    // Assign
    return this.prisma.meteringPoint.update({
      where: { id: point.id },
      data: { groupId },
    });
  }

  async findMeteringPoints(groupId: string, userId: string) {
    // 1. Verify group access
    await this.findOneForUser(groupId, userId);

    return this.prisma.meteringPoint.findMany({
      where: { groupId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findDiscoverableGroups() {
    return this.prisma.group.findMany({
      where: { isDiscoverable: true },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createJoinRequest(groupId: string, userId: string, dto: import('./dto/create-join-request.dto').CreateJoinRequestDto) {
    const group = await this.prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Skupina nebola nájdená');
    if (!group.isActive) throw new BadRequestException('Skupina nie je aktívna');
    if (!group.isDiscoverable) throw new BadRequestException('Skupina nie je objaviteľná');
    if (!group.acceptsJoinRequests) throw new BadRequestException('Skupina neprijíma žiadosti o pripojenie');

    const point = await this.prisma.meteringPoint.findUnique({ where: { id: dto.meteringPointId } });
    if (!point) throw new NotFoundException('Pripojené miesto nebolo nájdené');
    if (point.userId !== userId) throw new BadRequestException('Nie ste vlastníkom tohto pripojeného miesta');
    if (point.groupId) throw new BadRequestException('Zariadenie je už priradené k skupine');

    if (group.acceptedMeteringPointTypes !== 'BOTH' && group.acceptedMeteringPointTypes !== point.type as string) {
      throw new BadRequestException(`Skupina prijíma iba požiadavky typu ${group.acceptedMeteringPointTypes}`);
    }

    const existing = await this.prisma.groupJoinRequest.findFirst({
      where: {
        groupId,
        meteringPointId: point.id,
        status: 'PENDING',
      },
    });
    
    if (existing) throw new BadRequestException('Pre toto zariadenie a skupinu už existuje čakajúca žiadosť');

    return this.prisma.groupJoinRequest.create({
      data: {
        groupId,
        meteringPointId: point.id,
        requestedByUserId: userId,
        status: 'PENDING',
      },
    });
  }

  async findJoinRequests(groupId: string, userId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: { memberships: { where: { userId, role: 'OWNER' } } }
    });
    
    if (!group || (group.ownerId !== userId && group.memberships.length === 0)) {
      throw new BadRequestException('Iba vlastníci skupiny môžu vidieť žiadosti o pripojenie.');
    }

    return this.prisma.groupJoinRequest.findMany({
      where: { groupId, status: 'PENDING' },
      include: {
        meteringPoint: true,
        requestedByUser: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async setDiscoverable(groupId: string, userId: string, isDiscoverable: boolean) {
    const group = await this.prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Skupina nebola nájdená');
    if (group.ownerId !== userId) throw new BadRequestException('Iba vlastník skupiny môže meniť objaviteľnosť');

    return this.prisma.group.update({
      where: { id: groupId },
      data: { isDiscoverable },
    });
  }

  async updatePolicies(groupId: string, userId: string, dto: import('./dto/update-policies.dto').UpdateGroupPoliciesDto) {
    const group = await this.prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Skupina nebola nájdená');
    if (group.ownerId !== userId) throw new BadRequestException('Iba vlastník skupiny môže meniť politiky');

    return this.prisma.group.update({
      where: { id: groupId },
      data: {
        isActive: dto.isActive,
        acceptsJoinRequests: dto.acceptsJoinRequests,
        acceptsInvitations: dto.acceptsInvitations,
        acceptedMeteringPointTypes: dto.acceptedMeteringPointTypes,
      },
    });
  }

  async removeMeteringPoint(groupId: string, userId: string, meteringPointId: string) {
    const group = await this.prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Skupina nebola nájdená');
    if (group.ownerId !== userId) throw new BadRequestException('Iba vlastník skupiny môže odstraňovať pripojené miesta');

    const point = await this.prisma.meteringPoint.findFirst({
      where: { id: meteringPointId, groupId },
    });

    if (!point) throw new BadRequestException('Pripojené miesto nie je priradené k tejto skupine');

    return this.prisma.meteringPoint.update({
      where: { id: meteringPointId },
      data: { groupId: null },
    });
  }

  async inviteMeteringPointByEic(groupId: string, userId: string, eic: string) {
    if (!eic) throw new BadRequestException('EIC je povinné');
    const group = await this.prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Skupina nebola nájdená');
    if (group.ownerId !== userId) throw new BadRequestException('Iba vlastník skupiny môže pozývať pripojené miesta');
    if (!group.isActive) throw new BadRequestException('Skupina nie je aktívna');
    if (!group.acceptsInvitations) throw new BadRequestException('Skupina neprijíma pozvánky');

    const point = await this.prisma.meteringPoint.findUnique({
      where: { eic },
      include: {
        joinRequests: { where: { status: 'PENDING' } },
        invitations: { where: { status: 'PENDING' } },
      }
    });

    if (!point) throw new NotFoundException('Pripojené miesto so zadaným EIC nebolo nájdené');
    if (point.groupId) throw new BadRequestException('Zariadenie je už priradené k inej skupine');
    if (group.acceptedMeteringPointTypes !== 'BOTH' && group.acceptedMeteringPointTypes !== point.type as string) {
      throw new BadRequestException(`Skupina prijíma iba požiadavky typu ${group.acceptedMeteringPointTypes}`);
    }
    if (point.joinRequests.length > 0) throw new BadRequestException('Pripojené miesto už má čakajúcu žiadosť o pripojenie');
    if (point.invitations.length > 0) throw new BadRequestException('Pripojené miesto už obdržalo pozvánku');

    return this.prisma.groupMeteringPointInvitation.create({
      data: {
        groupId,
        meteringPointId: point.id,
        invitedByUserId: userId,
        status: 'PENDING',
      }
    });
  }
}
