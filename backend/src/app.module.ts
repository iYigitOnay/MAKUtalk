import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
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
import { ClubsModule } from './clubs/clubs.module';
import { SpotModule } from './spot/spot.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60,
      limit: 100,
    }]),
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
    ClubsModule,
    SpotModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
