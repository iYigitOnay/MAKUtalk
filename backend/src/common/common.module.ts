import { Global, Module } from '@nestjs/common';
import { MediaProcessingService } from './utils/media-processing.service';

@Global()
@Module({
  providers: [MediaProcessingService],
  exports: [MediaProcessingService],
})
export class CommonModule {}
