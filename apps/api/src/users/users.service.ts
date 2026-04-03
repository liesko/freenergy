import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async topUpBudget(userId: string, amount: number) {
    if (!amount || amount <= 0) {
      throw new BadRequestException('Neplatná suma na dobitie');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        budget: {
          increment: amount,
        },
      },
    });

    return { success: true, newBudget: updatedUser.budget };
  }

  async getEnergyStats(userId: string) {
    // Hruba motorika / Mock logic for energy stats based on actual owned EICs
    const points = await this.prisma.meteringPoint.findMany({
      where: { userId },
    });

    const hasProduction = points.some(p => p.type === 'PRODUCTION');
    const hasConsumption = points.some(p => p.type === 'CONSUMPTION');

    // Simulate stats for the current month
    // Base unit: kWh
    const baseProduction = hasProduction ? 350 + Math.floor(Math.random() * 200) : 0;
    
    // Ak vyrobil energiu, povieme, že časť z nej v rámci skupín udal spotrebiteľom.
    const consumedSelfProduction = hasProduction ? Math.floor(baseProduction * (0.4 + Math.random() * 0.4)) : 0;

    // A mock trend history for 6 months (pre grafy)
    const history = [];
    const months = ['Október', 'November', 'December', 'Január', 'Február', 'Marec'];
    
    for (const month of months) {
      const prod = hasProduction ? 300 + Math.floor(Math.random() * 150) : 0;
      history.push({
        name: month,
        Vyrobené: prod,
        Spotrebované: hasProduction ? Math.floor(prod * 0.6) : 0,
      });
    }

    return {
      currentMonth: {
        produced: baseProduction,
        consumedFromProduction: consumedSelfProduction,
      },
      hasProduction,
      hasConsumption,
      history,
    };
  }
}
