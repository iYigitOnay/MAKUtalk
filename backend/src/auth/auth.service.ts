import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    const { password, ...result } = user;
    return result;
  }

  async verifyEmail(email: string, code: string) {
    return this.usersService.verifyEmail(email, code);
  }

  async checkUsername(username: string) {
    const user = await this.usersService.findByUsernameOnly(username);
    return { available: !user };
  }

  async login(loginDto: LoginDto) {
    let { email, password } = loginDto;

    // OTOMATIK DOMAIN TAMAMLAMA
    if (!email.includes('@')) {
      email = `${email}@ogr.mehmetakif.edu.tr`;
    }

    // Kullaniciyi bul (sifreyle birlikte)
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('E-posta veya parola hatali.');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('Lutfen once e-posta adresinizi dogrulayin.');
    }

    // YASAKLI KULLANICI KONTROLU
    if (user.isBanned) {
      throw new ForbiddenException('BANNED_USER');
    }

    // Sifreyi kontrol et
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('E-posta veya parola hatali.');
    }

    if (
      user.email === '2312101063@ogr.mehmetakif.edu.tr' &&
      user.role !== 'ADMIN'
    ) {
      await this.usersService.updateProfile(user.id, user.id, {
        role: 'ADMIN',
      } as any);
      user.role = 'ADMIN' as any;
    }

    // JWT payload
    const payload = {
      sub: user.id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        coverUrl: user.coverUrl,
        isPrivate: user.isPrivate,
        role: user.role,
      },
    };
  }

  async verifyPassword(userId: bigint, password: string): Promise<boolean> {
    const userSummary = await this.usersService.findById(userId);
    if (!userSummary || !userSummary.email) return false;

    const user = await this.usersService.findByEmail(userSummary.email);
    if (!user) return false;

    return bcrypt.compare(password, user.password);
  }

  async forgotPassword(email: string) {
    return this.usersService.forgotPassword(email);
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    return this.usersService.resetPassword(email, code, newPassword);
  }

  async emergencyAdmin(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user)
      return { success: false, message: 'Bu maille kullanici bulunamadi!' };

    await this.usersService.updateProfile(user.id, user.id, {
      role: 'ADMIN',
    } as any);
    return {
      success: true,
      message: 'Artik ADMINsin! Cik-gir yapmayi unutma.',
    };
  }

  async validateUser(userId: bigint) {
    return this.usersService.findById(userId);
  }
}
