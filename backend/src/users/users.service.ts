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
import { SnowflakeService } from '../common/snowflake/snowflake.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private snowflakeService: SnowflakeService,
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

    let role: any = 'USER';
    if (
      createUserDto.email.endsWith('@mehmetakif.edu.tr') &&
      !createUserDto.email.includes('@ogr.')
    ) {
      role = 'ACADEMIC';
    }

    const user = await this.prisma.user.create({
      data: {
        id: this.snowflakeService.getNextId(),
        ...createUserDto,
        password: hashedPassword,
        role: role,
        verificationCode: verificationCode,
      },
    });

    if (role === 'ACADEMIC') {
      const academicBadge = await this.prisma.badge.findFirst({
        where: { name: 'Akademisyen' },
      });
      if (academicBadge) {
        await this.prisma.userBadge.create({
          data: {
            id: this.snowflakeService.getNextId(), // SNOWFLAKE ID
            userId: user.id,
            badgeId: academicBadge.id,
          },
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

  async findByUsername(username: string, currentUserId?: bigint) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        badges: { include: { badge: true } },
        _count: {
          select: {
            posts: { where: { isDeleted: false } },
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('Kullanıcı bulunamadı.');

    let followStatus: 'FOLLOWING' | 'PENDING' | 'NONE' = 'NONE';
    let isFollowing = false;
    let isBlockedByMe = false;
    let isBlockedMe = false;

    if (currentUserId) {
      const [follow, request, blockByMe, blockMe] = await Promise.all([
        this.prisma.follow.findFirst({
          where: { followerId: currentUserId, followingId: user.id },
        }),
        this.prisma.followRequest.findFirst({
          where: { senderId: currentUserId, receiverId: user.id },
        }),
        this.prisma.block.findFirst({
          where: { blockerId: currentUserId, blockedId: user.id },
        }),
        this.prisma.block.findFirst({
          where: { blockerId: user.id, blockedId: currentUserId },
        }),
      ]);

      if (follow) {
        followStatus = 'FOLLOWING';
        isFollowing = true;
      } else if (request) {
        followStatus = 'PENDING';
      }

      isBlockedByMe = !!blockByMe;
      isBlockedMe = !!blockMe;
    }

    // Eğer o beni engellediyse, verileri kısıtlı döndürelim (Privacy)
    if (isBlockedMe) {
      return {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        isBlockedMe: true,
        isBlockedByMe: false, // O beni engellediği için benim engelim önemsiz kalabilir
        isPrivate: true,
        _count: { posts: 0, followers: 0, following: 0 }
      };
    }

    return { ...user, isFollowing, followStatus, isBlockedByMe, isBlockedMe };
  }

  async findById(id: bigint) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByIdWithStats(id: bigint, currentUserId?: bigint) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        badges: { include: { badge: true } },
        _count: {
          select: {
            posts: { where: { isDeleted: false } },
            followers: true,
            following: true,
          },
        },
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
    userId: bigint,
    currentUserId: bigint,
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

  async toggleBan(userId: bigint, currentUserId: bigint) {
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

  async deleteUser(userId: bigint, currentUserId: bigint) {
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

  async toggleBlock(blockerId: bigint, blockedId: bigint) {
    const existing = await this.prisma.block.findFirst({
      where: { blockerId, blockedId },
    });
    if (existing) {
      await this.prisma.block.delete({ where: { id: existing.id } });
      return { blocked: false };
    }
    await this.prisma.block.create({
      data: {
        id: this.snowflakeService.getNextId(), // SNOWFLAKE ID
        blockerId,
        blockedId,
      },
    });
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

  async getBlockedUsers(userId: bigint) {
    return this.prisma.block.findMany({
      where: { blockerId: userId },
      include: {
        blocked: {
          select: { id: true, username: true, fullName: true, avatarUrl: true },
        },
      },
    });
  }

  async createReport(reporterId: bigint, data: any) {
    const {
      reportedUserId,
      reportedPostId,
      reportedCommentId,
      reportedMessageId,
      reason,
      subReason,
    } = data;

    const existingReport = await this.prisma.report.findFirst({
      where: {
        reporterId,
        reportedPostId: reportedPostId || null,
        reportedCommentId: reportedCommentId || null,
        reportedUserId: reportedUserId || null,
        reportedMessageId: reportedMessageId || null,
      },
    });

    if (existingReport) {
      throw new ConflictException(
        'Bu içerik için zaten bir bildirimde bulundunuz.',
      );
    }

    const report = await this.prisma.report.create({
      data: {
        id: this.snowflakeService.getNextId(), // SNOWFLAKE ID
        reporterId,
        reportedUserId,
        reportedPostId,
        reportedCommentId,
        reportedMessageId,
        reason,
        subReason,
      },
    });

    const THRESHOLD = 3;

    if (reportedPostId) {
      const reportCount = await this.prisma.report.count({
        where: { reportedPostId },
      });

      if (reportCount >= THRESHOLD) {
        await this.prisma.post.update({
          where: { id: reportedPostId },
          data: { published: false },
        });
      }
    }

    if (reportedCommentId) {
      const reportCount = await this.prisma.report.count({
        where: { reportedCommentId },
      });

      if (reportCount >= THRESHOLD) {
        await this.prisma.comment.update({
          where: { id: reportedCommentId },
          data: { isDeleted: true },
        });
      }
    }

    if (reportedMessageId) {
      const reportCount = await this.prisma.report.count({
        where: { reportedMessageId },
      });

      if (reportCount >= THRESHOLD) {
        await this.prisma.message.update({
          where: { id: reportedMessageId },
          data: { isDeleted: true },
        });
      }
    }

    return report;
  }

  async createFeedback(userId: bigint, type: string, message: string) {
    if (!userId) throw new Error('UserId gerekli.');
    return this.prisma.feedback.create({
      data: {
        id: this.snowflakeService.getNextId(), // SNOWFLAKE ID
        userId,
        type,
        message,
      },
    });
  }

  async getAllBadges() {
    return this.prisma.badge.findMany({
      where: { type: 'USER' },
      orderBy: { name: 'asc' },
    });
  }

  async toggleUserBadge(
    userId: bigint,
    badgeId: bigint,
    currentUserId: bigint,
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
      await this.prisma.userBadge.create({
        data: {
          id: this.snowflakeService.getNextId(), // SNOWFLAKE ID
          userId,
          badgeId,
        },
      });
      return { assigned: true };
    }
  }

  async searchMentions(query: string, role?: string) {
    const q = query.toLowerCase().trim();
    const where: any = {
      OR: [
        { username: { contains: q, mode: 'insensitive' } },
        { fullName: { contains: q, mode: 'insensitive' } },
      ],
      isBanned: false,
    };
    if (role) {
      where.role = role;
    }
    return this.prisma.user.findMany({
      where,
      take: 15,
      select: {
        id: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        email: true,
        role: true,
      },
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
    await this.mailService.sendPasswordResetCode(email, code);
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
