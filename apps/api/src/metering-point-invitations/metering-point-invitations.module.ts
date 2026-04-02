import { Module } from '@nestjs/common';
import { MeteringPointInvitationsService } from './metering-point-invitations.service';
import { MeteringPointInvitationsController } from './metering-point-invitations.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [MeteringPointInvitationsController],
  providers: [MeteringPointInvitationsService],
})
export class MeteringPointInvitationsModule {}
