import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req, Query, ForbiddenException } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { AuthGuard } from '../auth/auth.guard';
import { AssignMeteringPointDto } from './dto/assign-metering-point.dto';
import { UpdateDiscoverableDto } from './dto/update-discoverable.dto';
import { RemoveMeteringPointDto } from './dto/remove-metering-point.dto';

@UseGuards(AuthGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  create(@Req() req: any, @Body() createGroupDto: CreateGroupDto) {
    return this.groupsService.create(req.user.id, createGroupDto);
  }

  @Patch(':id/discoverable')
  updateDiscoverable(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateDiscoverableDto) {
    return this.groupsService.setDiscoverable(id, req.user.id, dto.isDiscoverable);
  }

  @Patch(':id/policies')
  updatePolicies(@Req() req: any, @Param('id') id: string, @Body() dto: import('./dto/update-policies.dto').UpdateGroupPoliciesDto) {
    return this.groupsService.updatePolicies(id, req.user.id, dto);
  }

  @Patch(':id/entry-fee')
  updateEntryFee(@Req() req: any, @Param('id') id: string, @Body('entryFee') entryFee: number) {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Iba administrátor portálu môže zmeniť vstupný poplatok.');
    }
    return this.groupsService.updateEntryFee(id, entryFee);
  }

  @Post(':id/remove-metering-point')
  removeMeteringPoint(@Req() req: any, @Param('id') id: string, @Body() dto: RemoveMeteringPointDto) {
    return this.groupsService.removeMeteringPoint(id, req.user.id, dto.meteringPointId);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.groupsService.findAllForUser(req.user.id);
  }

  @Get('discoverable')
  findDiscoverable(@Query('q') query?: string) {
    return this.groupsService.findDiscoverableGroups(query);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.groupsService.findOneForUser(id, req.user.id);
  }

  @Get(':id/members')
  findMembers(@Req() req: any, @Param('id') id: string) {
    return this.groupsService.findMembers(id, req.user.id);
  }

  @Post(':id/invitations')
  inviteUser(@Req() req: any, @Param('id') id: string, @Body('email') email: string) {
    return this.groupsService.inviteUser(id, req.user.id, email);
  }

  @Post(':id/metering-points')
  assignMeteringPoint(@Req() req: any, @Param('id') id: string, @Body() assignDto: AssignMeteringPointDto) {
    return this.groupsService.assignMeteringPoint(id, req.user.id, assignDto);
  }

  @Get(':id/metering-points')
  findMeteringPoints(@Req() req: any, @Param('id') id: string) {
    return this.groupsService.findMeteringPoints(id, req.user.id);
  }

  @Post(':id/metering-point-invitations')
  inviteMeteringPoint(@Req() req: any, @Param('id') id: string, @Body('eic') eic: string) {
    return this.groupsService.inviteMeteringPointByEic(id, req.user.id, eic);
  }

  @Post(':id/join-requests')
  createJoinRequest(@Req() req: any, @Param('id') id: string, @Body() dto: import('./dto/create-join-request.dto').CreateJoinRequestDto) {
    return this.groupsService.createJoinRequest(id, req.user.id, dto);
  }

  @Get(':id/join-requests')
  findJoinRequests(@Req() req: any, @Param('id') id: string) {
    return this.groupsService.findJoinRequests(id, req.user.id);
  }
}
