import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // @Global sayesinde her modüle tek tek import etmemize gerek kalmaz
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
