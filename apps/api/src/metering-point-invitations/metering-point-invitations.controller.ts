import { Controller, Get, Post, Param, UseGuards, Req } from '@nestjs/common';
import { MeteringPointInvitationsService } from './metering-point-invitations.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('metering-point-invitations')
export class MeteringPointInvitationsController {
  constructor(private readonly meteringPointInvitationsService: MeteringPointInvitationsService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.meteringPointInvitationsService.findAllForUser(req.user.id);
  }

  @Post(':id/accept')
  accept(@Req() req: any, @Param('id') id: string) {
    return this.meteringPointInvitationsService.accept(id, req.user.id);
  }

  @Post(':id/reject')
  reject(@Req() req: any, @Param('id') id: string) {
    return this.meteringPointInvitationsService.reject(id, req.user.id);
  }
}
