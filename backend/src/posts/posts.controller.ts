import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'image', maxCount: 1 },
    { name: 'document', maxCount: 1 }
  ]))
  @Throttle({ medium: { limit: 2, ttl: 60000 } })
  create(
    @CurrentUser() user,
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles() files?: { image?: Express.Multer.File[], document?: Express.Multer.File[] },
  ) {
    return this.postsService.create(BigInt(user.id), createPostDto, files);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query('currentUserId') currentUserId?: string) {
    return this.postsService.findAll(
      currentUserId ? BigInt(currentUserId) : undefined,
    );
  }

  @Get('academic')
  @UseGuards(JwtAuthGuard)
  findAcademicFeed(@Query('currentUserId') currentUserId?: string) {
    return this.postsService.findAcademicFeed(
      currentUserId ? BigInt(currentUserId) : undefined,
    );
  }

  @Get('bookmarks')
  @UseGuards(JwtAuthGuard)
  findBookmarks(@CurrentUser() user) {
    return this.postsService.findBookmarks(BigInt(user.id));
  }

  @Post(':id/bookmark')
  @UseGuards(JwtAuthGuard)
  toggleBookmark(@Param('id') id: string, @CurrentUser() user) {
    return this.postsService.toggleBookmark(BigInt(user.id), BigInt(id));
  }

  @Get('category/:categoryId')
  findByCategory(
    @Param('categoryId') categoryId: string,
    @Query('currentUserId') currentUserId?: string,
  ) {
    return this.postsService.findByCategory(
      BigInt(categoryId),
      currentUserId ? BigInt(currentUserId) : undefined,
    );
  }

  @Get('my-posts')
  @UseGuards(JwtAuthGuard)
  findMyPosts(@CurrentUser() user) {
    return this.postsService.findMyPosts(BigInt(user.id));
  }

  @Post(':id/repost')
  @UseGuards(JwtAuthGuard)
  @Throttle({ medium: { limit: 20, ttl: 30000 } })
  toggleRepost(@Param('id') id: string, @CurrentUser() user) {
    return this.postsService.toggleRepost(BigInt(user.id), BigInt(id));
  }

  @Get('user/:userId/reposts')
  findUserReposts(
    @Param('userId') userId: string,
    @Query('currentUserId') currentUserId?: string,
  ) {
    return this.postsService.findUserReposts(
      BigInt(userId),
      currentUserId ? BigInt(currentUserId) : undefined,
    );
  }

  @Get('user/:userId/likes')
  findLikedPosts(
    @Param('userId') userId: string,
    @Query('currentUserId') currentUserId?: string,
  ) {
    return this.postsService.findLikedPosts(
      BigInt(userId),
      currentUserId ? BigInt(currentUserId) : undefined,
    );
  }

  @Get(':id/thread')
  getThread(
    @Param('id') id: string,
    @Query('currentUserId') currentUserId?: string,
  ) {
    return this.postsService.getThread(
      BigInt(id),
      currentUserId ? BigInt(currentUserId) : undefined,
    );
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('currentUserId') currentUserId?: string,
  ) {
    return this.postsService.findOne(
      BigInt(id),
      currentUserId ? BigInt(currentUserId) : undefined,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @CurrentUser() user,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(BigInt(id), BigInt(user.id), updatePostDto);
  }

  @Patch(':id/pin')
  @UseGuards(JwtAuthGuard)
  togglePin(@Param('id') id: string, @CurrentUser() user) {
    return this.postsService.togglePin(BigInt(user.id), BigInt(id));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @CurrentUser() user) {
    return this.postsService.remove(BigInt(id), BigInt(user.id));
  }

  @Post(':id/refresh-sentiment')
  @UseGuards(JwtAuthGuard)
  refreshSentiment(@Param('id') id: string, @CurrentUser() user) {
    return this.postsService.refreshSentiment(BigInt(id), BigInt(user.id));
  }
}
