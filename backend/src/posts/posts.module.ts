import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { AiModule } from '../ai/ai.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ChatModule } from '../chat/chat.module';
import { HashtagModule } from '../hashtags/hashtag.module';
import { PostProcessorService } from './post-processor.service';

@Module({
  imports: [AiModule, NotificationsModule, ChatModule, HashtagModule],
  controllers: [PostsController],
  providers: [PostsService, PostProcessorService],
  exports: [PostsService],
})
export class PostsModule {}
