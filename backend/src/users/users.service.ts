import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { MailService } from '../mail/mail.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanUnverifiedUsers() {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    const deleted = await this.prisma.user.deleteMany({
      where: { isVerified: false, createdAt: { lt: twentyFourHoursAgo } },
    });
    if (deleted.count > 0) { console.log(`🧹 TEMİZLİK: ${deleted.count} adet doğrulanmamış hesap silindi.`); }
  }

  async create(createUserDto: CreateUserDto) {
    const { email, username, password, fullName } = createUserDto;
    const lowerPassword = password.toLowerCase();
    const blacklisted = ['123456', '12345678', 'password', 'parola', 'sifre123', 'makutalk', 'mehmetakif', 'maku123'];
    if (blacklisted.some(p => lowerPassword.includes(p))) throw new ConflictException('Çok yaygın şifre.');
    if (lowerPassword.includes(username.toLowerCase())) throw new ConflictException('Şifre kullanıcı adını içeremez.');

    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email: { equals: email, mode: 'insensitive' } }, { username: { equals: username, mode: 'insensitive' } }] },
    });
    if (existingUser) throw new ConflictException('E-posta veya kullanıcı adı kullanımda.');

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    let role: any = 'USER';
    if (email.endsWith('@mehmetakif.edu.tr') && !email.includes('@ogr.mehmetakif.edu.tr')) role = 'ACADEMIC';

    const user = await this.prisma.user.create({
      data: { email, username, password: hashedPassword, fullName, verificationCode, isVerified: false, role: role },
    });

    if (role === 'ACADEMIC') {
      try {
        let bad = await this.prisma.badge.findUnique({ where: { name: 'Akademisyen' } });
        if (!bad) bad = await this.prisma.badge.create({ data: { name: 'Akademisyen', icon: 'academic', color: '#1E3A8A' } });
        await this.prisma.userBadge.create({ data: { userId: user.id, badgeId: bad.id } });
      } catch {}
    }
    try { await this.mailService.sendVerificationCode(user.email, verificationCode); } catch {}
    return user;
  }

  async verifyEmail(email: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.verificationCode !== code) throw new ForbiddenException('Geçersiz kod.');
    return this.prisma.user.update({ where: { email }, data: { isVerified: true, verificationCode: null } });
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı.');
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.prisma.user.update({ where: { email }, data: { verificationCode: code } });
    try { await this.mailService.sendPasswordResetCode(email, code); return { message: 'Kod gönderildi.' }; }
    catch { throw new Error('Mail gönderilemedi.'); }
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.verificationCode !== code) throw new ForbiddenException('Geçersiz kod.');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return this.prisma.user.update({ where: { email }, data: { password: hashedPassword, verificationCode: null, isVerified: true } });
  }

  async findByEmail(email: string) { return this.prisma.user.findUnique({ where: { email } }); }
  async findById(id: number) { const user = await this.prisma.user.findUnique({ where: { id } }); return user ? { ...user, password: '' } : null; }

  async updateProfile(userId: number, currentUserId: number, updateData: UpdateUserDto) {
    if (userId !== currentUserId) throw new ForbiddenException('Yetkisiz.');
    return this.prisma.user.update({ where: { id: userId }, data: updateData, include: { badges: { include: { badge: true } }, _count: true } });
  }

  async findByIdWithStats(userId: number, currentUserId?: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { badges: { include: { badge: true } }, _count: true } });
    if (!user) throw new NotFoundException('Kullanıcı yok.');
    let isFollowing = false;
    if (currentUserId && currentUserId !== userId) {
      const f = await this.prisma.follow.findUnique({ where: { followerId_followingId: { followerId: currentUserId, followingId: userId } } });
      isFollowing = !!f;
    }
    return { ...user, isFollowing };
  }

  async getUserPosts(userId: number, currentUserId?: number) {
    const posts = await this.prisma.post.findMany({
      where: { authorId: userId, published: true, repostId: null },
      include: { author: { include: { badges: { include: { badge: true } } } }, category: true, _count: true },
      orderBy: { createdAt: 'desc' }
    });
    if (currentUserId && posts.length > 0) {
      const likes = await this.prisma.like.findMany({ where: { userId: currentUserId, postId: { in: posts.map(p => p.id) } } });
      const likedIds = new Set(likes.map(l => l.postId));
      return posts.map(p => ({ ...p, isLiked: likedIds.has(p.id) }));
    }
    return posts;
  }

  async findByUsernameOnly(username: string) { return this.prisma.user.findFirst({ where: { username: { equals: username, mode: 'insensitive' } } }); }

  async findByUsername(username: string, currentUserId?: number) {
    const user = await this.prisma.user.findFirst({ where: { username: { equals: username, mode: 'insensitive' } }, include: { badges: { include: { badge: true } }, _count: true } });
    if (!user) throw new NotFoundException('Kullanıcı yok.');
    let isFollowing = false, isBlocked = false, isReqSent = false;
    if (currentUserId && currentUserId !== user.id) {
      const [f, b, r] = await Promise.all([
        this.prisma.follow.findUnique({ where: { followerId_followingId: { followerId: currentUserId, followingId: user.id } } }),
        this.prisma.block.findUnique({ where: { blockerId_blockedId: { blockerId: currentUserId, blockedId: user.id } } }),
        this.prisma.followRequest.findUnique({ where: { senderId_receiverId: { senderId: currentUserId, receiverId: user.id } } })
      ]);
      isFollowing = !!f; isBlocked = !!b; isReqSent = !!r;
    }
    return { ...user, isFollowing, isBlocked, isFollowRequestSent: isReqSent };
  }

  async toggleBlock(blockerId: number, blockedId: number) {
    const ex = await this.prisma.block.findUnique({ where: { blockerId_blockedId: { blockerId, blockedId } } });
    if (ex) { await this.prisma.block.delete({ where: { id: ex.id } }); return { blocked: false }; }
    await this.prisma.block.create({ data: { blockerId, blockedId } });
    await this.prisma.follow.deleteMany({ where: { OR: [{ followerId: blockerId, followingId: blockedId }, { followerId: blockedId, followingId: blockerId }] } });
    return { blocked: true };
  }

  async getBlockedUsers(userId: number) { return this.prisma.block.findMany({ where: { blockerId: userId }, include: { blocked: true } }); }

  async createReport(reporterId: number, data: any) {
    // BUILD FIX: Prisma generate yeni alanları görmediği için cast ediyoruz
    return (this.prisma.report as any).create({
      data: {
        reporterId,
        reportedUserId: data.reportedUserId,
        reportedPostId: data.reportedPostId,
        reportedCommentId: data.reportedCommentId,
        reason: data.reason,
        subReason: data.subReason,
        status: 'PENDING',
      },
    });
  }

  async toggleBan(userId: number, currentUserId: number) {
    const adm = await this.prisma.user.findUnique({ where: { id: currentUserId } });
    if (!adm || adm.role !== 'ADMIN') throw new ForbiddenException('Yetkisiz.');
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role === 'ADMIN') throw new ForbiddenException('Geçersiz işlem.');
    const upd = await this.prisma.user.update({ where: { id: userId }, data: { isBanned: !user.isBanned } });
    return { banned: upd.isBanned };
  }

  async toggleUserBadge(userId: number, badgeId: number, currentUserId: number) {
    const ex = await this.prisma.userBadge.findUnique({ where: { userId_badgeId: { userId, badgeId } } });
    if (ex) { await this.prisma.userBadge.delete({ where: { id: ex.id } }); return { assigned: false }; }
    await this.prisma.userBadge.create({ data: { userId, badgeId } });
    return { assigned: true };
  }

  async deleteUser(userId: number, currentUserId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role === 'ADMIN') throw new ForbiddenException('Silinemez.');
    await this.prisma.user.delete({ where: { id: userId } });
    return { success: true };
  }

  async createFeedback(userId: number | null, type: string, message: string) { return (this.prisma as any).feedback.create({ data: { type, message, userId } }); }
  async getAllBadges() { return this.prisma.badge.findMany({ orderBy: { name: 'asc' } }); }
  async searchMentions(query: string) { return (this.prisma as any).user.findMany({ where: { username: { contains: query, mode: 'insensitive' }, isBanned: false }, take: 5 }); }
}
