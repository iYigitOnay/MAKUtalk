import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: createUserDto.email },
          { username: createUserDto.username },
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException(
        'Bu e-posta veya kullanıcı adı zaten kullanımda.',
      );
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    // AKADEMİSYEN OTOMATIK ROL ATAMASI (@mehmetakif.edu.tr)
    let role: any = 'USER';
    if (
      createUserDto.email.endsWith('@mehmetakif.edu.tr') &&
      !createUserDto.email.includes('@ogr.')
    ) {
      role = 'ACADEMIC';
    }

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        role: role,
        verificationCode: verificationCode,
      },
    });

    // AKADEMİSYEN ROZETİ OTOMATIK ATAMA
    if (role === 'ACADEMIC') {
      const academicBadge = await this.prisma.badge.findFirst({
        where: { name: 'Akademisyen' },
      });
      if (academicBadge) {
        await this.prisma.userBadge.create({
          data: { userId: user.id, badgeId: academicBadge.id },
        });
      }
    }

    try {
      await this.mailService.sendVerificationCode(user.email, verificationCode);
    } catch (error) {
      console.error('Mail gönderme hatası:', error);
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { badges: { include: { badge: true } } },
    });
  }

  async findByUsernameOnly(username: string) {
    return this.prisma.user.findUnique({ where: { username } });
  }

  // Controller'ın beklediği metod
  async findByUsername(username: string, currentUserId?: number) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        badges: { include: { badge: true } },
        _count: { select: { posts: true, followers: true, following: true } },
      },
    });

    if (!user) throw new NotFoundException('Kullanıcı bulunamadı.');

    let isFollowing = false;
    let isBlocked = false;

    if (currentUserId) {
      const follow = await this.prisma.follow.findFirst({
        where: { followerId: currentUserId, followingId: user.id },
      });
      isFollowing = !!follow;

      const block = await this.prisma.block.findFirst({
        where: { blockerId: currentUserId, blockedId: user.id },
      });
      isBlocked = !!block;
    }

    return { ...user, isFollowing, isBlocked };
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByIdWithStats(id: number, currentUserId?: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        badges: { include: { badge: true } },
        _count: { select: { posts: true, followers: true, following: true } },
      },
    });
    if (!user) throw new NotFoundException();
    return user;
  }

  async verifyEmail(email: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.verificationCode !== code) {
      throw new UnauthorizedException('Doğrulama kodu hatalı.');
    }
    return this.prisma.user.update({
      where: { email },
      data: { isVerified: true, verificationCode: null },
    });
  }

  async updateProfile(
    userId: number,
    currentUserId: number,
    data: any,
    files?: {
      avatar?: Express.Multer.File[];
      cover?: Express.Multer.File[];
    },
  ) {
    const fs = require('fs');
    const path = require('path');
    const sharp = require('sharp');

    if (userId !== currentUserId) {
      const currentUser = await this.prisma.user.findUnique({
        where: { id: currentUserId },
      });
      if (currentUser?.role !== 'ADMIN') throw new ForbiddenException();
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı.');

    const updateData = { ...data };
    const uploadedFiles: string[] = [];

    try {
      // AVATAR İŞLEME
      if (files?.avatar?.[0]) {
        const file = files.avatar[0];
        const fileName = `avatar-${userId}-${Date.now()}.webp`;
        const uploadPath = path.join(
          process.cwd(),
          'uploads',
          'avatars',
          fileName,
        );

        await sharp(file.buffer)
          .resize(400, 400, { fit: 'cover' })
          .webp({ quality: 80 })
          .toFile(uploadPath);

        updateData.avatarUrl = `/uploads/avatars/${fileName}`;
        uploadedFiles.push(uploadPath);

        if (user.avatarUrl && user.avatarUrl.startsWith('/uploads/avatars/')) {
          const oldPath = path.join(process.cwd(), user.avatarUrl);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
      }

      if (files?.cover?.[0]) {
        const file = files.cover[0];
        const fileName = `cover-${userId}-${Date.now()}.webp`;
        const uploadPath = path.join(
          process.cwd(),
          'uploads',
          'covers',
          fileName,
        );

        await sharp(file.buffer)
          .resize(1200, 400, { fit: 'cover' })
          .webp({ quality: 80 })
          .toFile(uploadPath);

        updateData.coverUrl = `/uploads/covers/${fileName}`;
        uploadedFiles.push(uploadPath);

        if (user.coverUrl && user.coverUrl.startsWith('/uploads/covers/')) {
          const oldPath = path.join(process.cwd(), user.coverUrl);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
      }

      return await this.prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          username: true,
          fullName: true,
          bio: true,
          avatarUrl: true,
          coverUrl: true,
          isPrivate: true,
          role: true,
          department: true,
          class: true,
        },
      });
    } catch (error) {
      uploadedFiles.forEach((filePath) => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
      throw error;
    }
  }

  async toggleBan(userId: number, currentUserId: number) {
    const admin = await this.prisma.user.findUnique({
      where: { id: currentUserId },
    });
    if (admin?.role !== 'ADMIN') throw new ForbiddenException();

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException();

    return this.prisma.user.update({
      where: { id: userId },
      data: { isBanned: !user.isBanned },
    });
  }

  async deleteUser(userId: number, currentUserId: number) {
    const admin = await this.prisma.user.findUnique({
      where: { id: currentUserId },
    });
    if (
      admin?.role !== 'ADMIN' &&
      admin?.email !== '2312101063@ogr.mehmetakif.edu.tr'
    ) {
      throw new ForbiddenException();
    }
    return this.prisma.user.delete({ where: { id: userId } });
  }

  async getUserPosts(userId: number, currentUserId?: number) {
    return this.prisma.post.findMany({
      where: { authorId: userId, published: true, repostId: null },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            badges: { include: { badge: true } },
          },
        },
        category: true,
        _count: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async toggleBlock(blockerId: number, blockedId: number) {
    const existing = await this.prisma.block.findFirst({
      where: { blockerId, blockedId },
    });
    if (existing) {
      await this.prisma.block.delete({ where: { id: existing.id } });
      return { blocked: false };
    }
    await this.prisma.block.create({ data: { blockerId, blockedId } });
    // Bloklayınca takibi de bırak
    await this.prisma.follow.deleteMany({
      where: {
        OR: [
          { followerId: blockerId, followingId: blockedId },
          { followerId: blockedId, followingId: blockerId },
        ],
      },
    });
    return { blocked: true };
  }

  async getBlockedUsers(userId: number) {
    return this.prisma.block.findMany({
      where: { blockerId: userId },
      include: {
        blocked: {
          select: { id: true, username: true, fullName: true, avatarUrl: true },
        },
      },
    });
  }

  async createReport(reporterId: number, data: any) {
    return (this.prisma as any).report.create({
      data: {
        reporterId,
        reportedUserId: data.reportedUserId,
        reportedPostId: data.reportedPostId,
        reportedCommentId: data.reportedCommentId,
        reason: data.reason,
        subReason: data.subReason,
      },
    });
  }

  async createFeedback(userId: number | null, type: string, message: string) {
    return (this.prisma as any).feedback.create({
      data: { userId, type, message },
    });
  }

  async getAllBadges() {
    return this.prisma.badge.findMany({
      where: { type: 'USER' },
      orderBy: { name: 'asc' },
    });
  }

  async toggleUserBadge(
    userId: number,
    badgeId: number,
    currentUserId: number,
  ) {
    const admin = await this.prisma.user.findUnique({
      where: { id: currentUserId },
    });
    if (admin?.role !== 'ADMIN') throw new ForbiddenException();

    const badge = await this.prisma.badge.findUnique({
      where: { id: badgeId },
    });
    if (!badge || badge.type !== 'USER') throw new ForbiddenException();

    const ex = await this.prisma.userBadge.findUnique({
      where: { userId_badgeId: { userId, badgeId } },
    });
    if (ex) {
      await this.prisma.userBadge.delete({ where: { id: ex.id } });
      return { assigned: false };
    } else {
      await this.prisma.userBadge.create({ data: { userId, badgeId } });
      return { assigned: true };
    }
  }

  async searchMentions(query: string, role?: string) {
    const where: any = {
      username: { contains: query, mode: 'insensitive' },
      isBanned: false,
    };
    if (role) {
      where.role = role;
    }
    return this.prisma.user.findMany({
      where,
      take: 5,
      select: { id: true, username: true, fullName: true, avatarUrl: true, email: true },
    });
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı.');
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.prisma.user.update({
      where: { email },
      data: { verificationCode: code },
    });
    await this.mailService.sendVerificationCode(email, code);
    return { message: 'Sıfırlama kodu gönderildi.' };
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.verificationCode !== code)
      throw new ForbiddenException('Kod hatalı.');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return this.prisma.user.update({
      where: { email },
      data: { password: hashedPassword, verificationCode: null },
    });
  }
}
