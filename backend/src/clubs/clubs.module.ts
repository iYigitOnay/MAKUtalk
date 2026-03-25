import { Module } from '@nestjs/common';
import { ClubsService } from './clubs.service';
import { ClubsController } from './clubs.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SnowflakeModule } from '../common/snowflake/snowflake.module';

@Module({
  imports: [PrismaModule, SnowflakeModule],
  controllers: [ClubsController],
  providers: [ClubsService],
  exports: [ClubsService],
})
export class ClubsModule {}
