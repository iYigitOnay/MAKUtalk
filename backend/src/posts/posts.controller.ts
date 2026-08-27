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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';

@ApiTags('Posts (Gönderiler)')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Yeni bir gönderi oluşturur' })
  @ApiConsumes('multipart/form-data') // Dosya yükleme desteğini Swagger'da gösterir
  @ApiResponse({ status: 201, description: 'Gönderi başarıyla oluşturuldu.' })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'document', maxCount: 1 },
      { name: 'video', maxCount: 1 },
    ]),
  )
  @Throttle({ medium: { limit: 2, ttl: 60000 } })
  create(
    @CurrentUser() user,
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles()
    files?: {
      image?: Express.Multer.File[];
      document?: Express.Multer.File[];
      video?: Express.Multer.File[];
    },
  ) {
    return this.postsService.create(BigInt(user.id), createPostDto, files);
  }

  @Get()
  @ApiOperation({ summary: 'Tüm gönderileri listeler' })
  findAll(@Query('currentUserId') currentUserId?: string) {
    return this.postsService.findAll(
      currentUserId ? BigInt(currentUserId) : undefined,
    );
  }

  @Get('academic')
  @ApiOperation({ summary: 'Akademik duyuru akışını getirir' })
  findAcademic(@Query('currentUserId') currentUserId?: string) {
    return this.postsService.findAcademicFeed(
      currentUserId ? BigInt(currentUserId) : undefined,
    );
  }

  @Get('bookmarks')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Kullanıcının yer işaretlerine eklediği gönderileri getirir' })
  findBookmarks(@CurrentUser() user) {
    return this.postsService.findBookmarks(BigInt(user.id));
  }

  @Post(':id/bookmark')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Gönderiyi yer işaretlerine ekler/çıkarır' })
  toggleBookmark(@Param('id') id: string, @CurrentUser() user) {
    return this.postsService.toggleBookmark(BigInt(user.id), BigInt(id));
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Belirli bir kategoriye ait gönderileri getirir' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Giriş yapan kullanıcının kendi gönderilerini getirir' })
  findMyPosts(@CurrentUser() user) {
    return this.postsService.findMyPosts(BigInt(user.id));
  }

  @Post(':id/repost')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Gönderiyi repost eder/iptal eder' })
  @Throttle({ medium: { limit: 20, ttl: 30000 } })
  toggleRepost(@Param('id') id: string, @CurrentUser() user) {
    return this.postsService.toggleRepost(BigInt(user.id), BigInt(id));
  }

  @Get('user/:userId/reposts')
  @ApiOperation({ summary: 'Belirli bir kullanıcının repostlarını getirir' })
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
  @ApiOperation({ summary: 'Belirli bir kullanıcının beğendiği gönderileri getirir' })
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
  @ApiOperation({ summary: 'Bir gönderinin alt yanıtlarını (thread) getirir' })
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
  @ApiOperation({ summary: 'Tek bir gönderi detayını getirir' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Gönderiyi günceller' })
  update(
    @Param('id') id: string,
    @CurrentUser() user,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(BigInt(id), BigInt(user.id), updatePostDto);
  }

  @Patch(':id/pin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Gönderiyi sabitler/sabitlemeyi kaldırır' })
  togglePin(@Param('id') id: string, @CurrentUser() user) {
    return this.postsService.togglePin(BigInt(user.id), BigInt(id));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Gönderiyi siler' })
  remove(@Param('id') id: string, @CurrentUser() user) {
    return this.postsService.remove(BigInt(id), BigInt(user.id));
  }

  @Post(':id/refresh-sentiment')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Gönderinin duygu analizini (sentiment) yeniler' })
  refreshSentiment(@Param('id') id: string, @CurrentUser() user) {
    return this.postsService.refreshSentiment(BigInt(id), BigInt(user.id));
  }

  @Post(':id/refresh-ai')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Gönderinin yapay zeka analizlerini yeniler' })
  refreshAI(@Param('id') id: string, @CurrentUser() user) {
    return this.postsService.refreshAI(BigInt(id), BigInt(user.id));
  }
}
