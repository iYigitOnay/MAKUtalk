import { Global, Module } from '@nestjs/common';
import { MediaProcessingService } from './utils/media-processing.service';
import { CleanupService } from './tasks/cleanup.service';

@Global()
@Module({
  providers: [MediaProcessingService, CleanupService],
  exports: [MediaProcessingService, CleanupService],
})
export class CommonModule {}
