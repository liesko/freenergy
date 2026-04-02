import { Controller, Get, Post, Param, UseGuards, Req } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.invitationsService.findAllForUser(req.user.id);
  }

  @Post(':id/accept')
  accept(@Req() req: any, @Param('id') id: string) {
    return this.invitationsService.accept(id, req.user.id);
  }

  @Post(':id/reject')
  reject(@Req() req: any, @Param('id') id: string) {
    return this.invitationsService.reject(id, req.user.id);
  }
}
