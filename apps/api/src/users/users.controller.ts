import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me/energy-stats')
  getEnergyStats(@Req() req: any) {
    return this.usersService.getEnergyStats(req.user.id);
  }

  @Post('me/budget/top-up')
  topUpBudget(@Req() req: any, @Body('amount') amount: number) {
    return this.usersService.topUpBudget(req.user.id, amount);
  }
}
