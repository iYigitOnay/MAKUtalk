import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
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
import { EventsModule } from './events/events.module';
import { LoggerModule } from './common/logger/logger.module';
import { SnowflakeModule } from './common/snowflake/snowflake.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule,
    SnowflakeModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 10, // 3 -> 10 yapıldı
      },
      {
        name: 'medium',
        ttl: 60000,
        limit: 150, // 100 -> 150 yapıldı
      },
      {
        name: 'long',
        ttl: 3600000,
        limit: 2000, // 1000 -> 2000 yapıldı
      },
    ]),
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
    EventsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
