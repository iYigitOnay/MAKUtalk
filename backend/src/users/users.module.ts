import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AdminController } from './admin.controller';
import { MailModule } from '../mail/mail.module';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [MailModule, PostsModule],
  controllers: [UsersController, AdminController],
  providers: [UsersService],
  exports: [UsersService], // AuthModule kullanacak
})
export class UsersModule {}
