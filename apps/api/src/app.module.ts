import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validate } from './env.validation';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { GroupsModule } from './groups/groups.module';
import { InvitationsModule } from './invitations/invitations.module';
import { MeteringPointsModule } from './metering-points/metering-points.module';
import { JoinRequestsModule } from './join-requests/join-requests.module';
import { MeteringPointInvitationsModule } from './metering-point-invitations/metering-point-invitations.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      envFilePath: '../../.env', // Pointing to root .env
    }),
    PrismaModule,
    AuthModule,
    GroupsModule,
    InvitationsModule,
    MeteringPointsModule,
    JoinRequestsModule,
    MeteringPointInvitationsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
