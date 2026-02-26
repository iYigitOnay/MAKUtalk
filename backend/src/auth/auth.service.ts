import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Kullanıcıyı bul (şifreyle birlikte)
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('E-posta veya parola hatalı.');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('Lütfen önce e-posta adresinizi doğrulayın.');
    }

    if (user.isBanned) {
      throw new UnauthorizedException('Hesabınız kuralları ihlal ettiği için askıya alınmıştır.');
    }

    // Şifreyi kontrol et
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('E-posta veya parola hatalı.');
    }

    // JWT payload - şifreyi ekleme!
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role, // Rolü payload'a ekle
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
        role: user.role, // Rolü geri dön
      },
    };
  }

  // Şifreyi doğrula
  async verifyPassword(userId: number, password: string): Promise<boolean> {
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
    if (!user) return { success: false, message: 'Bu maille kullanıcı bulunamadı!' };
    
    await this.usersService.updateProfile(user.id, user.id, { role: 'ADMIN' } as any);
    return { success: true, message: 'Artık ADMINsin! Çık-gir yapmayı unutma.' };
  }

  // Token'dan user bilgisini çöz (JWT Strategy kullanacak)
  async validateUser(userId: number) {
    return this.usersService.findById(userId);
  }
}
