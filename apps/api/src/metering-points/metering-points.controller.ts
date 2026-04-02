import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { MeteringPointsService } from './metering-points.service';
import { CreateMeteringPointDto } from './dto/create-metering-point.dto';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('metering-points')
export class MeteringPointsController {
  constructor(private readonly meteringPointsService: MeteringPointsService) {}

  @Post()
  create(@Req() req: any, @Body() createDto: CreateMeteringPointDto) {
    return this.meteringPointsService.create(req.user.id, createDto);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.meteringPointsService.findAllForUser(req.user.id);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.meteringPointsService.findOneForUser(id, req.user.id);
  }

  @Post(':id/leave-group')
  leaveGroup(@Req() req: any, @Param('id') id: string) {
    return this.meteringPointsService.leaveGroup(id, req.user.id);
  }
}
