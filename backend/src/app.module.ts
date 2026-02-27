import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { CategoriesModule } from './categories/categories.module';
import { LikesModule } from './likes/likes.module';
import { CommentsModule } from './comments/comments.module';
import { FollowModule } from './follow/follow.module';
import { SearchModule } from './search/search.module';
import { AiModule } from './ai/ai.module';
import { MailModule } from './mail/mail.module';
import { CampusModule } from './campus/campus.module';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationsModule } from './notifications/notifications.module';
import { HashtagModule } from './hashtags/hashtag.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    UsersModule,
    AuthModule,
    PostsModule,
    CategoriesModule,
    LikesModule,
    CommentsModule,
    FollowModule,
    SearchModule,
    AiModule,
    MailModule,
    CampusModule,
    NotificationsModule,
    HashtagModule,
    ChatModule,
  ],
})
export class AppModule {}
