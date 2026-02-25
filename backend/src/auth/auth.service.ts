import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

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
      },
    };
  }

  // Token'dan user bilgisini çöz (JWT Strategy kullanacak)
  async validateUser(userId: number) {
    return this.usersService.findById(userId);
  }
}
