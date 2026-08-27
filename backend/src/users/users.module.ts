import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AdminController } from './admin.controller';
import { MailModule } from '../mail/mail.module';
import { PostsModule } from '../posts/posts.module';
import { HashtagModule } from '../hashtags/hashtag.module';

@Module({
  imports: [MailModule, PostsModule, HashtagModule],
  controllers: [UsersController, AdminController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
