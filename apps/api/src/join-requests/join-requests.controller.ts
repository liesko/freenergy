import { Controller, Post, Get, Param, UseGuards, Req } from '@nestjs/common';
import { JoinRequestsService } from './join-requests.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('join-requests')
export class JoinRequestsController {
  constructor(private readonly joinRequestsService: JoinRequestsService) {}

  @Get('sent')
  findSent(@Req() req: any) {
    return this.joinRequestsService.findSent(req.user.id);
  }

  @Get('received')
  findReceived(@Req() req: any) {
    return this.joinRequestsService.findReceived(req.user.id);
  }

  @Post(':id/approve')
  approve(@Req() req: any, @Param('id') id: string) {
    return this.joinRequestsService.approve(id, req.user.id);
  }

  @Post(':id/reject')
  reject(@Req() req: any, @Param('id') id: string) {
    return this.joinRequestsService.reject(id, req.user.id);
  }

  @Post(':id/cancel')
  cancel(@Req() req: any, @Param('id') id: string) {
    return this.joinRequestsService.cancel(id, req.user.id);
  }
}
