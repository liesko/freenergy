import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMeteringPointDto } from './dto/create-metering-point.dto';
import { Prisma } from 'database';

@Injectable()
export class MeteringPointsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createDto: CreateMeteringPointDto) {
    try {
      return await this.prisma.meteringPoint.create({
        data: {
          eic: createDto.eic,
          name: createDto.name,
          type: createDto.type,
          userId: userId,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Pripojené miesto s týmto EIC už globálne existuje.');
        }
      }
      throw error;
    }
  }

  async findAllForUser(userId: string) {
    return this.prisma.meteringPoint.findMany({
      where: { userId },
      include: {
        group: { select: { id: true, name: true } },
        joinRequests: {
          where: { status: 'PENDING' },
          include: { group: { select: { id: true, name: true } } }
        },
        invitations: {
          where: { status: 'PENDING' },
          include: { group: { select: { id: true, name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneForUser(id: string, userId: string) {
    const point = await this.prisma.meteringPoint.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!point) {
      throw new NotFoundException('Pripojené miesto nebolo nájdené alebo nie ste jeho vlastníkom.');
    }

    return point;
  }

  async leaveGroup(id: string, userId: string) {
    const point = await this.prisma.meteringPoint.findFirst({
      where: { id, userId },
    });

    if (!point) {
      throw new NotFoundException('Pripojené miesto nebolo nájdené alebo nie ste jeho vlastníkom.');
    }

    if (!point.groupId) {
      throw new BadRequestException('Pripojené miesto nie je priradené k žiadnej skupine.');
    }

    return this.prisma.meteringPoint.update({
      where: { id },
      data: { groupId: null },
    });
  }
}
