import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  Patch,
  UseGuards,
  Delete,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { PostsService } from '../posts/posts.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
  ) {}

  @Get('badges/all')
  async getAllBadges() {
    return this.usersService.getAllBadges();
  }

  @Get('me/blocked')
  @UseGuards(JwtAuthGuard)
  async getBlockedUsers(@CurrentUser() user) {
    return this.usersService.getBlockedUsers(BigInt(user.id));
  }

  @Get('search-mentions')
  async searchMentions(
    @Query('q') query: string,
    @Query('role') role?: string,
  ) {
    return this.usersService.searchMentions(query || '', role);
  }

  @Get('username/:username')
  async getUserByUsername(
    @Param('username') username: string,
    @Query('currentUserId') currentUserId?: string,
  ) {
    const userId = currentUserId ? BigInt(currentUserId) : undefined;
    return this.usersService.findByUsername(username, userId);
  }

  @Get(':id')
  async getUserProfile(
    @Param('id') id: string,
    @Query('currentUserId') currentUserId?: string,
  ) {
    const userId = currentUserId ? BigInt(currentUserId) : undefined;
    return this.usersService.findByIdWithStats(BigInt(id), userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'avatar', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
      ],
      {
        limits: {
          fileSize: 20 * 1024 * 1024, // 20 MB
        },
      },
    ),
  )
  async updateProfile(
    @Param('id') id: string,
    @CurrentUser() user,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFiles()
    files?: {
      avatar?: Express.Multer.File[];
      cover?: Express.Multer.File[];
    },
  ) {
    return this.usersService.updateProfile(
      BigInt(id),
      BigInt(user.id),
      updateUserDto,
      files,
    );
  }

  @Get(':id/posts')
  async getUserPosts(
    @Param('id') id: string,
    @Query('currentUserId') currentUserId?: string,
  ) {
    const userId = currentUserId ? BigInt(currentUserId) : undefined;
    return this.postsService.getUserPosts(BigInt(id), userId);
  }

  @Get(':id/replies')
  async getUserReplies(
    @Param('id') id: string,
    @Query('currentUserId') currentUserId?: string,
  ) {
    const userId = currentUserId ? BigInt(currentUserId) : undefined;
    return this.postsService.getUserReplies(BigInt(id), userId);
  }

  @Post(':id/block')
  @UseGuards(JwtAuthGuard)
  async toggleBlock(@Param('id') id: string, @CurrentUser() user) {
    return this.usersService.toggleBlock(BigInt(user.id), BigInt(id));
  }

  @Post('report')
  @UseGuards(JwtAuthGuard)
  async reportUser(@CurrentUser() user, @Body() body: any) {
    // Body içindeki ID'leri BigInt'e çevir (Eğer varsa)
    const data = { ...body };
    if (data.reportedUserId) data.reportedUserId = BigInt(data.reportedUserId);
    if (data.reportedPostId) data.reportedPostId = BigInt(data.reportedPostId);
    if (data.reportedCommentId)
      data.reportedCommentId = BigInt(data.reportedCommentId);
    if (data.reportedMessageId)
      data.reportedMessageId = BigInt(data.reportedMessageId);

    return this.usersService.createReport(BigInt(user.id), data);
  }

  @Post(':id/ban')
  @UseGuards(JwtAuthGuard)
  async toggleBan(@Param('id') id: string, @CurrentUser() user) {
    return this.usersService.toggleBan(BigInt(id), BigInt(user.id));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteUserByAdmin(@Param('id') id: string, @CurrentUser() user) {
    return this.usersService.deleteUser(BigInt(id), BigInt(user.id));
  }

  @Post(':id/badges/:badgeId')
  @UseGuards(JwtAuthGuard)
  async toggleBadge(
    @Param('id') userId: string,
    @Param('badgeId') badgeId: string,
    @CurrentUser() admin,
  ) {
    return this.usersService.toggleUserBadge(
      BigInt(userId),
      BigInt(badgeId),
      BigInt(admin.id),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('feedback')
  async submitFeedback(
    @CurrentUser() user,
    @Body() body: { type: string; message: string },
  ) {
    if (!user || !user.id) {
      throw new BadRequestException('Kullanıcı kimliği gerekli');
    }
    return this.usersService.createFeedback(
      BigInt(user.id),
      body.type,
      body.message,
    );
  }
}
