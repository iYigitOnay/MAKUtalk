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

  @Get(':id')
  async getUserProfile(
    @Param('id', ParseIntPipe) id: number,
    @Query('currentUserId', ParseIntPipe) currentUserId?: number,
  ) {
    return this.usersService.findByIdWithStats(id, currentUserId);
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

  @Get('username/:username')
  async getUserByUsername(
    @Param('username') username: string,
    @Query('currentUserId', ParseIntPipe) currentUserId?: number,
  ) {
    return this.usersService.findByUsername(username, currentUserId);
  }

  @Get(':id/posts')
  async getUserPosts(
    @Param('id', ParseIntPipe) id: number,
    @Query('currentUserId', ParseIntPipe) currentUserId?: number,
  ) {
    return this.usersService.getUserPosts(id, currentUserId);
  }
}
