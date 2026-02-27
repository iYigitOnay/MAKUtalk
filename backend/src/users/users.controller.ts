import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Patch,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    const { password, ...result } = user;
    return result;
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() body: { email: string; code: string }) {
    return this.usersService.verifyEmail(body.email, body.code);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() body: { email: string }) {
    return this.usersService.forgotPassword(body.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() body: { email: string; code: string; newPassword: string }) {
    return this.usersService.resetPassword(body.email, body.code, body.newPassword);
  }

  // STATIK ROUTE'LAR (ÖNCELİKLİ)
  @Get('badges/all')
  async getAllBadges() {
    return this.usersService.getAllBadges();
  }

  @Get('me/blocked')
  @UseGuards(JwtAuthGuard)
  async getBlockedUsers(@CurrentUser() user) {
    return this.usersService.getBlockedUsers(user.id);
  }

  @Get('username/:username')
  async getUserByUsername(
    @Param('username') username: string,
    @Query('currentUserId') currentUserId?: string,
  ) {
    const userId = currentUserId ? parseInt(currentUserId) : undefined;
    return this.usersService.findByUsername(username, userId);
  }

  @Get('search-mentions')
  async searchMentions(@Query('q') query: string) {
    return this.usersService.searchMentions(query || '');
  }

  // DINAMIK ROUTE'LAR (DAHA SONRA)
  @Get(':id')
  async getUserProfile(
    @Param('id', ParseIntPipe) id: number,
    @Query('currentUserId') currentUserId?: string,
  ) {
    const userId = currentUserId ? parseInt(currentUserId) : undefined;
    return this.usersService.findByIdWithStats(id, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateProfile(id, user.id, updateUserDto);
  }

  @Get(':id/posts')
  async getUserPosts(
    @Param('id', ParseIntPipe) id: number,
    @Query('currentUserId') currentUserId?: string,
  ) {
    const userId = currentUserId ? parseInt(currentUserId) : undefined;
    return this.usersService.getUserPosts(id, userId);
  }

  @Post(':id/block')
  @UseGuards(JwtAuthGuard)
  async toggleBlock(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user,
  ) {
    return this.usersService.toggleBlock(user.id, id);
  }

  @Post('report')
  @UseGuards(JwtAuthGuard)
  async reportUser(
    @CurrentUser() user,
    @Body() body: { reportedUsername: string; reason: string; subReason: string },
  ) {
    return this.usersService.reportUser(user.username, body.reportedUsername, body.reason, body.subReason);
  }

  @Post(':id/ban')
  @UseGuards(JwtAuthGuard)
  async toggleBan(@Param('id', ParseIntPipe) id: number, @CurrentUser() user) {
    return this.usersService.toggleBan(id, user.id);
  }

  @Delete(':id/admin')
  @UseGuards(JwtAuthGuard)
  async deleteUserByAdmin(@Param('id', ParseIntPipe) id: number, @CurrentUser() user) {
    return this.usersService.deleteUser(id, user.id);
  }

  @Post(':id/badges/:badgeId')
  @UseGuards(JwtAuthGuard)
  async toggleBadge(
    @Param('id', ParseIntPipe) userId: number,
    @Param('badgeId', ParseIntPipe) badgeId: number,
    @CurrentUser() admin,
  ) {
    return this.usersService.toggleUserBadge(userId, badgeId, admin.id);
  }

  @Post('feedback')
  async submitFeedback(
    @CurrentUser() user,
    @Body() body: { type: string; message: string },
  ) {
    const userId = user ? user.id : null;
    return this.usersService.createFeedback(userId, body.type, body.message);
  }
}
