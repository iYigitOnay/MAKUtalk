import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  create(
    @CurrentUser() user,
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.postsService.create(user.id, createPostDto, file);
  }

  @Get()
  findAll(@Query('currentUserId') currentUserId?: string) {
    return this.postsService.findAll(
      currentUserId ? +currentUserId : undefined,
    );
  }

  @Get('category/:categoryId')
  findByCategory(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Query('currentUserId') currentUserId?: string,
  ) {
    return this.postsService.findByCategory(
      categoryId,
      currentUserId ? +currentUserId : undefined,
    );
  }

  @Get('my-posts')
  @UseGuards(JwtAuthGuard)
  findMyPosts(@CurrentUser() user) {
    return this.postsService.findMyPosts(user.id);
  }

  @Post(':id/repost')
  @UseGuards(JwtAuthGuard)
  toggleRepost(@Param('id', ParseIntPipe) id: number, @CurrentUser() user) {
    return this.postsService.toggleRepost(user.id, id);
  }

  @Get('user/:userId/reposts')
  findUserReposts(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('currentUserId') currentUserId?: string,
  ) {
    return this.postsService.findUserReposts(
      userId,
      currentUserId ? +currentUserId : undefined,
    );
  }

  @Get('user/:userId/likes')
  findLikedPosts(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('currentUserId') currentUserId?: string,
  ) {
    return this.postsService.findLikedPosts(
      userId,
      currentUserId ? +currentUserId : undefined,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('currentUserId') currentUserId?: string,
  ) {
    return this.postsService.findOne(
      id,
      currentUserId ? +currentUserId : undefined,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, user.id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user) {
    return this.postsService.remove(id, user.id);
  }
}
