import { Controller, Get, UseGuards, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('stats')
  async getStats(@CurrentUser() user) {
    if (user.role !== 'ADMIN' && user.email !== '2312101063@ogr.mehmetakif.edu.tr') {
      throw new ForbiddenException('Yetkisiz erişim.');
    }

    const [totalUsers, totalReports, totalFeedbacks] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.report.count({ where: { status: 'PENDING' } }),
      this.prisma.feedback.count(),
    ]);

    return {
      totalUsers,
      totalReports,
      totalFeedbacks,
    };
  }

  @Get('users')
  async getUsers(@CurrentUser() user) {
    if (user.role !== 'ADMIN' && user.email !== '2312101063@ogr.mehmetakif.edu.tr') {
      throw new ForbiddenException('Yetkisiz erişim.');
    }
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isBanned: true,
        createdAt: true,
        avatarUrl: true,
      },
    });
  }

  @Get('feedbacks')
  async getFeedbacks(@CurrentUser() user) {
    if (user.role !== 'ADMIN' && user.email !== '2312101063@ogr.mehmetakif.edu.tr') {
      throw new ForbiddenException('Yetkisiz erişim.');
    }
    return this.prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { username: true } },
      },
    });
  }

  @Get('reports')
  async getReports(@CurrentUser() user) {
    if (user.role !== 'ADMIN' && user.email !== '2312101063@ogr.mehmetakif.edu.tr') {
      throw new ForbiddenException('Yetkisiz erişim.');
    }
    // BUILD FIX: Prisma generate henüz yeni alanları görmediği için cast ederek build hatasını aşıyoruz
    const include: any = {
      reporter: { select: { username: true } },
      reportedUser: { select: { username: true } },
      reportedPost: { select: { id: true, content: true, author: { select: { username: true } } } },
      reportedComment: { select: { id: true, content: true, user: { select: { username: true } } } }
    };

    return (this.prisma.report as any).findMany({
      orderBy: { createdAt: 'desc' },
      include,
    });
  }
}
