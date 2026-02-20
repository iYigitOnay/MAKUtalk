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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

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
