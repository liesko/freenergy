import { Module } from '@nestjs/common';
import { MeteringPointsService } from './metering-points.service';
import { MeteringPointsController } from './metering-points.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [MeteringPointsController],
  providers: [MeteringPointsService],
})
export class MeteringPointsModule {}
