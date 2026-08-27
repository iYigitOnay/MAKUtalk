import { Module } from '@nestjs/common';
import { SpotService } from './spot.service';
import { SpotController } from './spot.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SnowflakeModule } from '../common/snowflake/snowflake.module';

@Module({
  imports: [PrismaModule, SnowflakeModule],
  controllers: [SpotController],
  providers: [SpotService],
  exports: [SpotService],
})
export class SpotModule {}
