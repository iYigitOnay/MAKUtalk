import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { email, username, password, fullName } = createUserDto;

    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      throw new ConflictException(
        'Bu e-posta veya kullanıcı adı zaten kullanımda.',
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 haneli kod

    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        fullName,
        verificationCode,
        isVerified: false,
      },
    });

    // Kayıt sonrası doğrulama kodunu gönder
    try {
      await this.mailService.sendVerificationCode(user.email, verificationCode);
    } catch (error) {
      console.error('Doğrulama kodu gönderim hatası:', error);
    }

    return user;
  }

  async verifyEmail(email: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı.');
    }

    if (user.verificationCode !== code) {
      throw new ForbiddenException('Doğrulama kodu hatalı.');
    }

    return this.prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        verificationCode: null, // Kod kullanıldıktan sonra temizle
      },
    });
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException('Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı.');
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    await this.prisma.user.update({
      where: { email },
      data: { verificationCode: resetCode },
    });

    try {
      await this.mailService.sendPasswordResetCode(email, resetCode);
      return { message: 'Şifre sıfırlama kodu e-posta adresinize gönderildi.' };
    } catch (error) {
      console.error('Şifre sıfırlama kodu gönderim hatası:', error);
      throw new Error('E-posta gönderilemedi.');
    }
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı.');
    }

    if (user.verificationCode !== code) {
      throw new ForbiddenException('Sıfırlama kodu hatalı.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    return this.prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        verificationCode: null,
        isVerified: true, // Şifre sıfırlayabiliyorsa hesabı doğrulanmış sayılabilir veya doğrulanmış olmalıdır
      },
    });
  }

  // Auth için - şifreyi döner
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  // Kendi profili için - şifreyi döndürmez
  async findById(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    const { password, ...result } = user;
    return result;
  }

  // Profil güncelleme
  async updateProfile(
    userId: number,
    currentUserId: number,
    updateData: UpdateUserDto,
  ) {
    // Sadece kendi profilini güncelleyebilir
    if (userId !== currentUserId) {
      throw new ForbiddenException('Bu profili düzenleme yetkiniz yok.');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı.');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        bio: true,
        avatarUrl: true,
        coverUrl: true,
        department: true,
        class: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    return updatedUser;
  }

  // Public profil - istatistiklerle
  async findByIdWithStats(userId: number, currentUserId?: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        bio: true,
        avatarUrl: true,
        coverUrl: true,
        department: true,
        class: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı.');
    }

    let isFollowing = false;
    if (currentUserId && currentUserId !== userId) {
      const follow = await this.prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: userId,
          },
        },
      });
      isFollowing = !!follow;
    }

    return {
      ...user,
      isFollowing,
    };
  }

  // Kullanıcıya ait postlar
  async getUserPosts(userId: number, currentUserId?: number) {
    const posts = await this.prisma.post.findMany({
      where: {
        authorId: userId,
        published: true,
        repostId: null, // Sadece orijinal postlar
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        category: true,
        repostOf: {
          include: {
            author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
            category: true,
            _count: { select: { likes: true, comments: true, reposts: true } }
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            reposts: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (currentUserId && posts.length > 0) {
      const postIds = posts.map((p) => p.id);
      const userLikes = await this.prisma.like.findMany({
        where: {
          userId: currentUserId,
          postId: { in: postIds },
        },
        select: { postId: true },
      });
      const likedPostIds = new Set(userLikes.map((like) => like.postId));

      return posts.map((post) => ({
        ...post,
        isLiked: likedPostIds.has(post.id),
      }));
    }

    return posts;
  }

  // Username'e göre kullanıcı bul
  async findByUsername(username: string, currentUserId?: number) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        bio: true,
        avatarUrl: true,
        coverUrl: true,
        department: true,
        class: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı.');
    }

    let isFollowing = false;
    if (currentUserId && currentUserId !== user.id) {
      const follow = await this.prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: user.id,
          },
        },
      });
      isFollowing = !!follow;
    }

    return {
      ...user,
      isFollowing,
    };
  }
}
